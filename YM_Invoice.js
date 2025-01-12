// YM_Invoice.js

document.addEventListener('DOMContentLoaded', function () {
    const addRowButton = document.getElementById('add-row');
    const productsBody = document.getElementById('products-body');

    const discountInput = document.getElementById('discount');
    const downPaymentInput = document.getElementById('down-payment');

    const subTotalField = document.getElementById('sub-total');
    const totalField = document.getElementById('total');
    const totalRemainingField = document.getElementById('total-remaining');

    // The two date fields in the HTML
    const dueDateField = document.getElementById('due-date');
    const paymentDeadlineField = document.getElementById('payment-deadline');

    // The event date input (customizable)
    const eventDateInput = document.getElementById('event-date');

    // Generate PDF button
    const generatePdfButton = document.getElementById('generate-pdf');

    // Format a number as IDR currency
    function formatCurrency(num) {
        return 'Rp.' + '\u00a0' + Number(num).toLocaleString('id-ID');
    }

    // Function to set the current date in Indonesian format
    function setCurrentDate() {
        const invoiceDateElement = document.getElementById('invoice-date');
        const today = new Date();

        // Options for Indonesian date formatting
        const options = {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        };

        const formattedDate = today.toLocaleDateString('id-ID', options);
        invoiceDateElement.textContent = formattedDate;
    }

    // Function to generate the next invoice number
    function generateInvoiceNumber() {
        const invoiceNumberElement = document.getElementById('invoice-number');
        const storageKey = 'lastInvoiceNumber';

        // Retrieve the last invoice number from localStorage
        let lastNumber = localStorage.getItem(storageKey);

        if (lastNumber === null) {
            // If no invoice number exists, start at 1
            lastNumber = 1;
        } else {
            // Parse the last number and increment it
            lastNumber = parseInt(lastNumber, 10) + 1;
        }

        // Format the number with leading zeros to make it 5 digits
        const formattedNumber = lastNumber.toString().padStart(5, '0');

        // Create the full invoice number string
        const invoiceNumber = `YM-INV#${formattedNumber}`;

        // Update the invoice number in the DOM
        invoiceNumberElement.textContent = invoiceNumber;

        // Store the updated number back into localStorage
        localStorage.setItem(storageKey, lastNumber);
    }

    // Function to auto-expand textarea vertically
    function autoExpandTextarea(textarea) {
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = (textarea.scrollHeight) + 'px'; // Set to scrollHeight
    }

    // Calculate totals for each product row
    function calculateTotals() {
        let subTotal = 0;

        // Loop through each row
        const rows = productsBody.querySelectorAll('tr');
        rows.forEach(row => {
            const qtyEl = row.querySelector('.qty');
            const hargaEl = row.querySelector('.harga');
            const totalEl = row.querySelector('.total');

            const qty = parseFloat(qtyEl.value) || 0;

            // Remove dots before parseInt
            const rawHarga = hargaEl.value.replace(/\./g, '');

            // Parse into integer instead of decimals
            const harga = parseInt(rawHarga, 10) || 0;

            const rowTotal = qty * harga;

            // Format rowTotal as IDR
            totalEl.textContent = formatCurrency(rowTotal);
            subTotal += rowTotal;
        });

        // Display sub-total
        subTotalField.textContent = formatCurrency(subTotal);

        // Discount
        const discount = parseFloat(discountInput.value.replace(/\./g, '')) || 0;
        const discounted = subTotal - discount;
        totalField.textContent = formatCurrency(discounted);

        // Down Payment
        const downPayment = parseFloat(downPaymentInput.value.replace(/\./g, '')) || 0;
        const remaining = discounted - downPayment;
        if (remaining === 0) {
            totalRemainingField.textContent = 'LUNAS';
        } else {
            totalRemainingField.textContent = formatCurrency(remaining);
        }
    }

    // Update due date to 3 days before Tanggal Acara
    function updateDueDate() {
        const eventDateStr = eventDateInput.value; // e.g. '2025-08-15'
        if (!eventDateStr) {
            dueDateField.textContent = '--';
            paymentDeadlineField.textContent = '--';
            return;
        }
        const eventDate = new Date(eventDateStr);

        // Subtract 3 days
        eventDate.setDate(eventDate.getDate() - 3);

        // Format in Indonesian style (e.g. 12 Agustus 2025)
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        const dueDateStr = eventDate.toLocaleDateString('id-ID', options);

        // Set both fields
        dueDateField.textContent = dueDateStr;
        paymentDeadlineField.textContent = dueDateStr;
    }

    function formatWithDots(valueString) {
        // Insert dots every 3 digits from the right
        const reversed = valueString.split('').reverse();
        const chunks = [];
        for (let i = 0; i < reversed.length; i += 3) {
            chunks.push(reversed.slice(i, i + 3).join(''));
        }
        // Join with dot and reverse back
        return chunks.join('.').split('').reverse().join('');
    }

    // On page load
    setCurrentDate();
    generateInvoiceNumber();
    updateDueDate();
    calculateTotals();

    // Initialize existing DESKRIPSI textareas to auto-expand
    const existingTextareas = productsBody.querySelectorAll('textarea.deskripsi-field');
    existingTextareas.forEach(textarea => {
        autoExpandTextarea(textarea);
    });

    // Whenever the event date changes, recalculate due date
    eventDateInput.addEventListener('change', updateDueDate);

    // Event listener to add a new row
    addRowButton.addEventListener('click', function () {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="produk" placeholder="Produk" /></td>
            <td><textarea class="deskripsi-field" placeholder="Deskripsi"></textarea></td>
            <td><input type="number" class="qty" value="1" min="1" /></td>
            <td><input type="text" class="harga" value="0" /></td>
            <td class="total">Rp. 0</td>
        `;
        productsBody.appendChild(newRow);

        // Initialize auto-expand for the new textarea
        const newTextarea = newRow.querySelector('textarea.deskripsi-field');
        if (newTextarea) {
            autoExpandTextarea(newTextarea);
        }

        // Recalculate totals once new row is added
        calculateTotals();
    });

    // When user types in qty/harga/deskripsi, recalc totals and auto-expand textarea
    productsBody.addEventListener('input', function (e) {
        if (e.target.classList.contains('harga')) {
            // Prevent negative
            const numericValue = parseFloat(e.target.value.replace(/\./g, '')) || 0;
            if (numericValue < 0) {
                e.target.value = '';
            }

            // Remove anything non-digits
            let numericValueStr = e.target.value.replace(/\D/g, '');
            // If empty or zero
            if (!numericValueStr) numericValueStr = '';

            // Format with dots: e.g., "10000" -> "10.000"
            const formatted = formatWithDots(numericValueStr);

            // Set the input's visible value
            e.target.value = formatted;
        }

        // If the input is DESKRIPSI textarea, auto-expand
        if (e.target.classList.contains('deskripsi-field')) {
            autoExpandTextarea(e.target);
        }

        // Then recalc totals
        if (e.target.classList.contains('qty') || e.target.classList.contains('harga')) {
            calculateTotals();
        }
    });

    // Event listeners for summary inputs (Diskon and Down Payment)
    [discountInput, downPaymentInput].forEach(input => {
        input.addEventListener('input', function (e) {
            // Prevent negative values
            let numericValue = e.target.value.replace(/\D/g, '');
            if (parseFloat(numericValue) < 0) {
                e.target.value = '';
                numericValue = '';
            }

            // Format with dots
            const formatted = formatWithDots(numericValue);
            e.target.value = formatted;

            // Then recalc totals
            calculateTotals();
        });
    });

    // Generate PDF (Print)
    generatePdfButton.addEventListener('click', function () {
        window.print();
    });

    window.addEventListener('beforeprint', function () {
        const textareas = document.querySelectorAll('textarea.deskripsi-field');
        textareas.forEach(textarea => {
            autoExpandTextarea(textarea);
        });
    });

});
