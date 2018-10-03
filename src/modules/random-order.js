//     random-order.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.randomOrder = (function() {
        function gra(numElements, exclude) {
            var origArray = [],
                resultArray = [],
                i;

            for (i = 0; i < numElements; i++) {
                if (exclude != null) if (excludeCheck(exclude, i)) continue;

                origArray.push(i);
            }

            while (origArray.length > 0 && resultArray.length < numElements) {
                var rdm = grn(origArray.length - 1);

                resultArray.push(origArray.splice(rdm, 1)[0]);
            }
            return resultArray;
        }

        function excludeCheck(exclude, num) {
            var i;
            for (i = 0; i < exclude.length; i++) {
                if (num == exclude[i]) return true;
            }
            return false;
        }

        function ra(ogArray, rtrnLen) {
            var randomArray = [],
            orderedArray = ogArray.concat(),
            n;

            rtrnLen = rtrnLen || ogArray.length;

            for (n = 0; n < rtrnLen; n++) {
                var tmpNum = grn(orderedArray.length - 1);

                randomArray[n] = orderedArray[tmpNum];
                orderedArray.splice(tmpNum, 1);
            }

            return randomArray;
        }

        function grn(max, min) {
            min = min || 0;
            //return a number between 0 and max
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        return {
            randomizeArray: ra,
            generateRandomArray: gra,
            getRandomNum: grn
        };
    })();
})(Scout);
