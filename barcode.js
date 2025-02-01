// ==UserScript==
// @name         Barcode Generator Tooltip
// @namespace    https://inside.amazon.com/
// @version      1.7
// @description  Displays a barcode tooltip for selected text
// @author       qkurndav@amazon.de
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    var tooltipBarcodeGen;
    var initialZoomFactor;

    function getSelectedText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type !== "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    function createBarcodeTooltip(selectedText) {
        tooltipBarcodeGen = document.createElement('div');
        tooltipBarcodeGen.className = 'tooltipBarcodeGen';

        var barcodeImage = document.createElement('img');
        const barcodeImageHeight = 200;
        const barcodeImageWidth = 500;
        const barcodeImageRes = 1; // change to "2" if you zoom out too much, otherwise the barcode is unreadable by scanners
        barcodeImage.src = `https://www.webarcode.com/barcode/image.php?code=${encodeURIComponent(selectedText)}&type=C128B&xres=`+ barcodeImageRes +`&height=`+ barcodeImageHeight +`&width=`+ barcodeImageWidth +`&font=5&output=png&style=197`;

        tooltipBarcodeGen.appendChild(barcodeImage);

        tooltipBarcodeGen.style.position = 'absolute';
        tooltipBarcodeGen.style.top = event.pageY + 'px';
        tooltipBarcodeGen.style.left = event.pageX + 'px';

        tooltipBarcodeGen.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        tooltipBarcodeGen.style.borderRadius = '6px';
        tooltipBarcodeGen.style.padding = '5px';
        tooltipBarcodeGen.style.zIndex = '9999';
        barcodeImage.style.border = '1px solid #fff';

        document.body.appendChild(tooltipBarcodeGen);

        // Store the initial zoom factor
        initialZoomFactor = window.devicePixelRatio;

        // Add a click event listener to close the tooltip when the left mouse button is clicked
        document.addEventListener('mousedown', clickHandler);

        // Add a resize event listener to adjust the size of the tooltip on zoom
        window.addEventListener('resize', resizeHandler);
    }

    function resizeHandler() {
        // Update the size of the tooltip on zoom
        if (tooltipBarcodeGen) {
            updateTooltipSize();
        }
    }

    function updateTooltipSize() {
        var currentZoomFactor = window.devicePixelRatio;

        // Adjust the size of the tooltip based on the zoom factor
        var newSize = (currentZoomFactor / initialZoomFactor) * 100;
        tooltipBarcodeGen.style.transform = `scale(${newSize}%)`;
    }

    function clickHandler() {
        // Remove the tooltip when the left mouse button is clicked
        removeBarcodeTooltip();
    }

    function removeBarcodeTooltip() {
        if (tooltipBarcodeGen) {
            tooltipBarcodeGen.remove();
            tooltipBarcodeGen = null;
        }

        // Remove the click and resize event listeners when the tooltip is removed
        document.removeEventListener('mousedown', clickHandler);
        window.removeEventListener('resize', resizeHandler);
    }

    document.addEventListener('mouseup', function(event) {
        var selectedText = getSelectedText().trim();

        if (/PALLET_|GAYLORD_|CART_|001_v|001_V$/.test(selectedText)) {
            // Remove any existing tooltip before creating a new one
            removeBarcodeTooltip();

            // Create and display the barcode tooltip
            createBarcodeTooltip(selectedText);
        }
    });
})();
