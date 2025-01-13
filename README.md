The PWA: https://bit.ly/Yusuf_Meiyanto_Invoice_App

Invoice is in HTML, CSS, and JavaScript. Separate files of `YM_Invoice.html`, `YM_Invoice.css`, and `YM_Invoice.js`. The description is as follow:

The invoice is A4. Top and bottom margins are 2,5 cm while left and right margins are 1 cm. It has rounded dark blue page borders.

Section 1 is a block of dark blue heading part.
- The heading is about 1/5 part of the whole A4 page.
- The heading contains white bold `INVOICE` text on its top-left and a logo from directory `./icons/icon-152.png` on its top-right.
- Below `INVOICE` text is smaller text of full date format text (date of invoice issuance) and invoice number (number input format `YM-INV#00001`, `YM-INV#00002`, etc.).

Section 2 is billing. It splits into two part, left and right.
- The left part:
"TAGIHAN DITUJUKAN KEPADA:
`Atas nama:` (text input)
`Tanggal Acara:` (full date format input)
`Tempat Acara:` (text input)".

- The right part:
"PEMBAYARAN DITUJUKAN KEPADA:
A.N. YUSUF MEIYANTO
BCA 033 1939 241
`Jatuh tempo pembayaran` = `Tanggal Acara` - `3 days`".

Section 3 is a table. 5 columns, blue line, no outer border.
- Table heading: `PRODUK`, `DESKRIPSI`, `QTY`, `HARGA` (`Rp.` currency format), `TOTAL` = `QTY` * `HARGA`.
- Small `+` button to add new row.

Section 4 is a summary table. It splits into two part, left and right.
- The left part is the summary table, 5 rows, they are:
`Sub-total:` = sum of `TOTAL`.
`Diskon:` (`Rp.` currency format).
`Total:` = `Sub-total` - `Diskon`.
`Down Payment (DP):` (`Rp.` currency format)
`TOTAL KEKURANGAN:` = `Total` - `Down Payment (DP)`

- The right part is intentionally left blank.

Section 5 is terms and conditions:
"SYARAT DAN KETENTUAN (bold and underlined)
Harap segera melakukan pembayran sebelum `Jatuh tempo pembayaran`".

Section 6 is address:
"Ruko Mojoroto Kav. 17
Jl. Kawi, Kota Kediri
Phone: 0811 3586 977"

Section 7 is `PRINT` button to simply download the invoice in `.pdf` file format.