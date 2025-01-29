// YM_Invoice.js

document.addEventListener('DOMContentLoaded', function () {
    // Example: store the date in ISO format
    let isoDateValue = '2025-01-01'; // default

    // Grab references to DOM elements
    const addRowButton = document.getElementById('add-row');
    const productsBody = document.getElementById('products-body');

    const discountInput = document.getElementById('discount');
    const downPaymentInput = document.getElementById('down-payment');

    const subTotalField = document.getElementById('sub-total');
    const totalField = document.getElementById('total');
    const totalRemainingField = document.getElementById('total-remaining');

    const dueDateField = document.getElementById('due-date');
    const paymentDeadlineField = document.getElementById('payment-deadline');

    // Our single text input that we want to be type="date" upon focus
    const eventDateInput = document.getElementById('event-date');

    // PDF print button
    const generatePdfButton = document.getElementById('generate-pdf');

    // --------------------------------------------------------------------
    // UTILITY: Format 'yyyy-mm-dd' to 'dd-mm-yyyy'
    function isoToDDMMYYYY(isoString) {
        if (!isoString) return '';
        const parts = isoString.split('-');
        if (parts.length < 3) return '';
        const [yyyy, mm, dd] = parts;
        return `${dd}-${mm}-${yyyy}`;
    }

    // UTILITY: Format IDR currency
    function formatCurrency(num) {
        return 'Rp.' + '\u00a0' + Number(num).toLocaleString('id-ID');
    }

    // UTILITY: Set invoice date in Indonesian format
    function setCurrentDate() {
        const invoiceDateElement = document.getElementById('invoice-date');
        const today = new Date();
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        invoiceDateElement.textContent = today.toLocaleDateString('id-ID', options);
    }

    // UTILITY: Generate invoice number
    function generateInvoiceNumber() {
        const invoiceNumberElement = document.getElementById('invoice-number');
        const storageKey = 'lastInvoiceNumber';

        let lastNumber = localStorage.getItem(storageKey);
        if (lastNumber === null) {
            lastNumber = 1;
        } else {
            lastNumber = parseInt(lastNumber, 10) + 1;
        }
        const formattedNumber = lastNumber.toString().padStart(5, '0');
        invoiceNumberElement.textContent = `YM-INV#${formattedNumber}`;
        localStorage.setItem(storageKey, lastNumber);
    }

    // UTILITY: Expand textarea
    function autoExpandTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }

    // UTILITY: Format digits with dots (###.###.###)
    function formatWithDots(valueString) {
        const reversed = valueString.split('').reverse();
        const chunks = [];
        for (let i = 0; i < reversed.length; i += 3) {
            chunks.push(reversed.slice(i, i + 3).join(''));
        }
        return chunks.join('.').split('').reverse().join('');
    }

    // CALC: Recalculate invoice totals
    function calculateTotals() {
        let subTotal = 0;
        const rows = productsBody.querySelectorAll('tr');
        rows.forEach(row => {
            const qtyEl = row.querySelector('.qty');
            const hargaEl = row.querySelector('.harga');
            const totalEl = row.querySelector('.total');

            const qty = parseFloat(qtyEl.value) || 0;
            const rawHarga = hargaEl.value.replace(/\./g, '');
            const harga = parseInt(rawHarga, 10) || 0;

            const rowTotal = qty * harga;
            totalEl.textContent = formatCurrency(rowTotal);
            subTotal += rowTotal;
        });

        subTotalField.textContent = formatCurrency(subTotal);

        const discount = parseFloat(discountInput.value.replace(/\./g, '')) || 0;
        const discounted = subTotal - discount;
        totalField.textContent = formatCurrency(discounted);

        const downPayment = parseFloat(downPaymentInput.value.replace(/\./g, '')) || 0;
        const remaining = discounted - downPayment;
        totalRemainingField.textContent = (remaining === 0)
            ? 'LUNAS'
            : formatCurrency(remaining);
    }

    // DUE DATE: 3 days before event
    function updateDueDate() {
        if (!isoDateValue) {
            dueDateField.textContent = '--';
            paymentDeadlineField.textContent = '--';
            return;
        }
        const eventDate = new Date(isoDateValue);
        eventDate.setDate(eventDate.getDate() - 3);

        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        const dueStr = eventDate.toLocaleDateString('id-ID', options);
        dueDateField.textContent = dueStr;
        paymentDeadlineField.textContent = dueStr;
    }

    // -------------------------------------------------------------
    // 1) On load, let's do some initial logic
    setCurrentDate();
    generateInvoiceNumber();
    // We assume isoDateValue has '2025-01-01' or whichever default
    // Show it in "dd-mm-yyyy" form in the single input
    eventDateInput.value = isoToDDMMYYYY(isoDateValue);

    // Then we do the rest
    updateDueDate();
    calculateTotals();

    // Expand existing textareas
    productsBody.querySelectorAll('textarea.deskripsi-field').forEach(autoExpandTextarea);

    // -------------------------------------------------------------
    // 2) The single input that can become a date picker on focus
    eventDateInput.addEventListener('focus', function () {
        // Switch to date so the native picker appears
        this.type = 'date';
        // Set to iso so the browser can parse it
        this.value = isoDateValue;
    });

    // We'll handle the user picking a date (on "change") and also on "blur"
    eventDateInput.addEventListener('change', function () {
        isoDateValue = this.value;                  // e.g. "2025-08-15"
    });
    eventDateInput.addEventListener('blur', function () {
        // Now user is done, so revert to type="text"
        // and show "dd-mm-yyyy"
        this.type = 'text';
        this.value = isoToDDMMYYYY(isoDateValue);

        // Also re-run your due date logic
        updateDueDate();
    });

    // -------------------------------------------------------------
    // 3) Add row
    addRowButton.addEventListener('click', function () {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="produk" placeholder="Produk" /></td>
            <td><textarea class="deskripsi-field" placeholder="Deskripsi"></textarea></td>
            <td><input type="number" class="qty" value="1" min="1" /></td>
            <td>
                <div class="price-field">
                    <span>Rp.</span>
                    <input type="text" class="harga" value="0" />
                </div>
            </td>
            <td class="total">Rp. 0</td>
        `;
        productsBody.appendChild(newRow);

        // Expand
        const newTextarea = newRow.querySelector('textarea.deskripsi-field');
        if (newTextarea) autoExpandTextarea(newTextarea);

        calculateTotals();
    });

    // -------------------------------------------------------------
    // 4) Listen for user input in the products table
    productsBody.addEventListener('input', function (e) {
        if (e.target.classList.contains('harga')) {
            let numericValueStr = e.target.value.replace(/\D/g, '');
            if (!numericValueStr) numericValueStr = '';
            const formatted = formatWithDots(numericValueStr);
            e.target.value = formatted;
        }
        if (e.target.classList.contains('deskripsi-field')) {
            autoExpandTextarea(e.target);
        }
        if (e.target.classList.contains('qty') || e.target.classList.contains('harga')) {
            calculateTotals();
        }
    });

    // -------------------------------------------------------------
    // 5) Summaries: discount & down payment
    [discountInput, downPaymentInput].forEach(input => {
        input.addEventListener('input', function () {
            let numericValueStr = this.value.replace(/\D/g, '');
            if (!numericValueStr) numericValueStr = '';
            const formatted = formatWithDots(numericValueStr);
            this.value = formatted;
            calculateTotals();
        });
    });

    // -------------------------------------------------------------
    // 6) Print
    generatePdfButton.addEventListener('click', function () {
        window.print();
    });

    // -------------------------------------------------------------
    // Ensure textareas are fully expanded before printing
    window.addEventListener('beforeprint', function () {
        productsBody.querySelectorAll('textarea.deskripsi-field').forEach(autoExpandTextarea);
    });
});
