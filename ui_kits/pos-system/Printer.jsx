// Printer.jsx — ESC/POS Bluetooth Thermal Printer Utility

const PrinterUtil = {
  device: null,
  char: null,

  async connect(serviceUUID, charUUID) {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUUID] }],
        optionalServices: [serviceUUID],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(serviceUUID);
      const characteristic = await service.getCharacteristic(charUUID);
      PrinterUtil.device = device;
      PrinterUtil.char = characteristic;
      return { ok: true, name: device.name };
    } catch(e) {
      return { ok: false, error: e.message };
    }
  },

  async printReceipt(order, store) {
    if (!PrinterUtil.char) return { ok: false, error: 'Printer not connected' };
    try {
      const lines = PrinterUtil.buildReceipt(order, store);
      const data = PrinterUtil.encode(lines);
      // Split into 20-byte chunks for BLE
      for (let i = 0; i < data.length; i += 20) {
        await PrinterUtil.char.writeValue(data.slice(i, i + 20));
      }
      return { ok: true };
    } catch(e) {
      return { ok: false, error: e.message };
    }
  },

  buildReceipt(order, store) {
    const line = (t) => t + '\n';
    const divider = '--------------------------------\n';
    const center = (t, width = 32) => {
      const pad = Math.max(0, Math.floor((width - t.length) / 2));
      return ' '.repeat(pad) + t + '\n';
    };
    const row = (l, r, width = 32) => {
      const space = Math.max(1, width - l.length - r.length);
      return l + ' '.repeat(space) + r + '\n';
    };

    let buf = '';
    buf += center('1885NY SMASH BURGERS');
    buf += center(store.name);
    buf += center('GSTIN: ' + store.gstin);
    buf += divider;
    buf += center('TAX INVOICE');
    buf += divider;
    buf += row('Bill No:', order.id.slice(-6).toUpperCase());
    buf += row('Date:', new Date(order.createdAt).toLocaleString('en-IN'));
    buf += row('Staff:', order.staffName);
    buf += row('Type:', order.orderType || 'Dine In');
    buf += divider;
    buf += row('Item', 'Amt');
    buf += divider;

    order.items.forEach(item => {
      buf += row(`${item.name} x${item.qty}`, fmt(item.total));
    });

    buf += divider;
    buf += row('Subtotal', fmt(order.subtotal));
    buf += row('CGST (' + order.cgstPct + '%)', fmt(order.cgstTotal));
    buf += row('SGST (' + order.sgstPct + '%)', fmt(order.sgstTotal));
    buf += divider;
    buf += row('TOTAL', fmt(order.grandTotal));
    buf += row('Payment', order.paymentMethod);
    if (order.paymentMethod === 'Cash') {
      buf += row('Cash Given', fmt(order.cashGiven || order.grandTotal));
      buf += row('Change', fmt((order.cashGiven || order.grandTotal) - order.grandTotal));
    }
    buf += divider;
    buf += center('Thank you for visiting!');
    buf += center('Delicious. Chef-Driven. Smash Burgers.');
    buf += '\n\n\n';
    return buf;
  },

  encode(text) {
    const ESC = 0x1B, GS = 0x1D;
    const init = [ESC, 0x40];
    const bold_on = [ESC, 0x45, 0x01];
    const bold_off = [ESC, 0x45, 0x00];
    const cut = [GS, 0x56, 0x41, 0x10];
    const enc = new TextEncoder();
    const textBytes = enc.encode(text);
    const all = new Uint8Array(init.length + textBytes.length + cut.length);
    all.set(init, 0);
    all.set(textBytes, init.length);
    all.set(cut, init.length + textBytes.length);
    return all;
  },

  // Fallback: print to browser window
  printBrowser(order, store) {
    const content = PrinterUtil.buildReceipt(order, store);
    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre">${content}</pre>`);
    win.document.close();
    win.print();
  },
};

Object.assign(window, { PrinterUtil });
