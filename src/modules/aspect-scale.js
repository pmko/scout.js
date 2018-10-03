//     aspect-scale.js
//     (c) 2015 Chris Colinsky https://github.com/pmko/scout.js
//     Licensed under the terms of the MIT license.

(function($) {
    $.aspectScale = (function() {
        function AspectScale(width, height) {
            this.startHeight = height;
            this.startWidth = width;
            this.newHeight = 0;
            this.newWidth = 0;
        }

        /**
         * Returns the height and width values to scale a display object to fill the available space.
         */
        AspectScale.prototype.getScaledDimensions = function(availWidth, availHeight) {
            if (this.startHeight * availWidth / this.startWidth >= availHeight) {
                this.newHeight = this.startHeight * availWidth / this.startWidth;
                this.newWidth = availWidth;
            } else if (startWidth * availHeight / startHeight >= availWidth) {
                this.newHeight = availHeight;
                this.newWidth = this.startWidth * availHeight / this.startHeight;
            }

            return {width: this.newWidth, height: this.newHeight};
        }

        /**
         * Returns the height and width values to scale a display object within the available space.
         */
        AspectScale.prototype.getContainedDimensions = function(availWidth, availHeight) {
            if (this.startHeight * availWidth / this.startWidth <= availHeight) {
                this.newHeight = this.startHeight * availWidth / this.startWidth;
                this.newWidth = availWidth;
            } else if (this.startWidth * availHeight / this.startHeight <= availWidth) {
                this.newHeight = availHeight;
                this.newWidth = this.startWidth * availHeight / this.startHeight;
            }

            return {width: this.newWidth, height: this.newHeight};
        }

        function createNewAspectScale(width, height) {
            return new AspectScale(width, height);
        }

        return {
            make: createNewAspectScale
        };
    })();
})(Scout);
