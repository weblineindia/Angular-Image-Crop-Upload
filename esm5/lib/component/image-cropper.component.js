/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, isDevMode, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { getTransformationsFromExifData, supportsAutomaticRotation } from '../utils/exif.utils';
import { resizeCanvas } from '../utils/resize.utils';
import { MoveTypes } from '../interfaces/move-start.interface';
var ImageCropperComponent = /** @class */ (function () {
    function ImageCropperComponent(sanitizer, cd) {
        this.sanitizer = sanitizer;
        this.cd = cd;
        this.Hammer = typeof window !== 'undefined'
            ? (/** @type {?} */ (((/** @type {?} */ (window))).Hammer))
            : null;
        this.setImageMaxSizeRetries = 0;
        this.cropperScaledMinWidth = 20;
        this.cropperScaledMinHeight = 20;
        this.exifTransform = { rotate: 0, flip: false };
        this.autoRotateSupported = supportsAutomaticRotation();
        this.stepSize = 3;
        this.marginLeft = '0px';
        this.imageVisible = false;
        this.moveTypes = MoveTypes;
        this.format = 'png';
        this.maintainAspectRatio = true;
        this.transform = {};
        this.aspectRatio = 1;
        this.resizeToWidth = 0;
        this.resizeToHeight = 0;
        this.cropperMinWidth = 0;
        this.cropperMinHeight = 0;
        this.canvasRotation = 0;
        this.initialStepSize = 3;
        this.roundCropper = false;
        this.onlyScaleDown = false;
        this.imageQuality = 92;
        this.autoCrop = true;
        this.containWithinAspectRatio = false;
        this.hideResizeSquares = false;
        this.cropper = {
            x1: -100,
            y1: -100,
            x2: 10000,
            y2: 10000
        };
        this.alignImage = 'center';
        this.disabled = false;
        this.imageCropped = new EventEmitter();
        this.startCropImage = new EventEmitter();
        this.imageLoaded = new EventEmitter();
        this.cropperReady = new EventEmitter();
        this.loadImageFailed = new EventEmitter();
        this.initCropper();
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ImageCropperComponent.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        this.onChangesInputImage(changes);
        if (this.originalImage && this.originalImage.complete && this.exifTransform
            && (changes.containWithinAspectRatio || changes.canvasRotation)) {
            this.transformOriginalImage();
        }
        if (changes.cropper) {
            this.setMaxSize();
            this.setCropperScaledMinSize();
            this.checkCropperPosition(false);
            this.doAutoCrop();
            this.cd.markForCheck();
        }
        if (changes.aspectRatio && this.imageVisible) {
            this.resetCropperPosition();
        }
        if (changes.transform) {
            this.transform = this.transform || {};
            this.setCssTransform();
            this.doAutoCrop();
        }
    };
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    ImageCropperComponent.prototype.onChangesInputImage = /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes.imageChangedEvent || changes.imageURL || changes.imageBase64 || changes.imageFile) {
            this.initCropper();
        }
        if (changes.imageChangedEvent && this.isValidImageChangedEvent()) {
            this.loadImageFile(this.imageChangedEvent.target.files[0]);
        }
        if (changes.imageURL && this.imageURL) {
            this.loadImageFromURL(this.imageURL);
        }
        if (changes.imageBase64 && this.imageBase64) {
            this.loadBase64Image(this.imageBase64);
        }
        if (changes.imageFile && this.imageFile) {
            this.loadImageFile(this.imageFile);
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.isValidImageChangedEvent = /**
     * @private
     * @return {?}
     */
    function () {
        return this.imageChangedEvent
            && this.imageChangedEvent.target
            && this.imageChangedEvent.target.files
            && this.imageChangedEvent.target.files.length > 0;
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.setCssTransform = /**
     * @private
     * @return {?}
     */
    function () {
        this.safeTransformStyle = this.sanitizer.bypassSecurityTrustStyle('scaleX(' + (this.transform.scale || 1) * (this.transform.flipH ? -1 : 1) + ')' +
            'scaleY(' + (this.transform.scale || 1) * (this.transform.flipV ? -1 : 1) + ')' +
            'rotate(' + (this.transform.rotate || 0) + 'deg)');
    };
    /**
     * @return {?}
     */
    ImageCropperComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        this.stepSize = this.initialStepSize;
        this.activatePinchGesture();
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.initCropper = /**
     * @private
     * @return {?}
     */
    function () {
        this.imageVisible = false;
        this.transformedImage = null;
        this.safeImgDataUrl = 'data:image/png;base64,iVBORw0KGg'
            + 'oAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAU'
            + 'AAarVyFEAAAAASUVORK5CYII=';
        this.moveStart = {
            active: false,
            type: null,
            position: null,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            clientX: 0,
            clientY: 0
        };
        this.maxSize = {
            width: 0,
            height: 0
        };
        this.originalSize = {
            width: 0,
            height: 0
        };
        this.transformedSize = {
            width: 0,
            height: 0
        };
        this.cropper.x1 = -100;
        this.cropper.y1 = -100;
        this.cropper.x2 = 10000;
        this.cropper.y2 = 10000;
    };
    /**
     * @private
     * @param {?} imageBase64
     * @param {?} imageType
     * @return {?}
     */
    ImageCropperComponent.prototype.loadImage = /**
     * @private
     * @param {?} imageBase64
     * @param {?} imageType
     * @return {?}
     */
    function (imageBase64, imageType) {
        if (this.isValidImageType(imageType)) {
            this.loadBase64Image(imageBase64);
        }
        else {
            this.loadImageFailed.emit();
        }
    };
    /**
     * @private
     * @param {?} file
     * @return {?}
     */
    ImageCropperComponent.prototype.loadImageFile = /**
     * @private
     * @param {?} file
     * @return {?}
     */
    function (file) {
        var _this = this;
        /** @type {?} */
        var fileReader = new FileReader();
        fileReader.onload = (/**
         * @param {?} event
         * @return {?}
         */
        function (event) { return _this.loadImage(event.target.result, file.type); });
        fileReader.readAsDataURL(file);
    };
    /**
     * @private
     * @param {?} type
     * @return {?}
     */
    ImageCropperComponent.prototype.isValidImageType = /**
     * @private
     * @param {?} type
     * @return {?}
     */
    function (type) {
        return /image\/(png|jpg|jpeg|bmp|gif|tiff|webp)/.test(type);
    };
    /**
     * @private
     * @param {?} imageBase64
     * @return {?}
     */
    ImageCropperComponent.prototype.loadBase64Image = /**
     * @private
     * @param {?} imageBase64
     * @return {?}
     */
    function (imageBase64) {
        var _this = this;
        this.autoRotateSupported
            .then((/**
         * @param {?} supported
         * @return {?}
         */
        function (supported) { return _this.checkExifAndLoadBase64Image(imageBase64, supported); }))
            .then((/**
         * @return {?}
         */
        function () { return _this.transformOriginalImage(); }))
            .catch((/**
         * @param {?} error
         * @return {?}
         */
        function (error) {
            _this.loadImageFailed.emit();
            _this.originalImage = null;
            _this.originalBase64 = null;
            console.error(error);
        }));
    };
    /**
     * @private
     * @param {?} imageBase64
     * @param {?} autoRotateSupported
     * @return {?}
     */
    ImageCropperComponent.prototype.checkExifAndLoadBase64Image = /**
     * @private
     * @param {?} imageBase64
     * @param {?} autoRotateSupported
     * @return {?}
     */
    function (imageBase64, autoRotateSupported) {
        var _this = this;
        return new Promise((/**
         * @param {?} resolve
         * @param {?} reject
         * @return {?}
         */
        function (resolve, reject) {
            _this.originalImage = new Image();
            _this.originalImage.onload = (/**
             * @return {?}
             */
            function () {
                _this.originalBase64 = imageBase64;
                _this.exifTransform = getTransformationsFromExifData(autoRotateSupported ? -1 : imageBase64);
                _this.originalSize.width = _this.originalImage.naturalWidth;
                _this.originalSize.height = _this.originalImage.naturalHeight;
                resolve();
            });
            _this.originalImage.onerror = reject;
            _this.originalImage.src = imageBase64;
        }));
    };
    /**
     * @private
     * @param {?} url
     * @return {?}
     */
    ImageCropperComponent.prototype.loadImageFromURL = /**
     * @private
     * @param {?} url
     * @return {?}
     */
    function (url) {
        var _this = this;
        /** @type {?} */
        var img = new Image();
        img.onerror = (/**
         * @return {?}
         */
        function () { return _this.loadImageFailed.emit(); });
        img.onload = (/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var canvas = document.createElement('canvas');
            /** @type {?} */
            var context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            _this.loadBase64Image(canvas.toDataURL());
        });
        img.crossOrigin = 'anonymous';
        img.src = url;
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.transformOriginalImage = /**
     * @private
     * @return {?}
     */
    function () {
        if (!this.originalImage || !this.originalImage.complete || !this.exifTransform) {
            return Promise.reject(new Error('No image loaded'));
        }
        /** @type {?} */
        var transformedBase64 = this.transformImageBase64();
        return this.setTransformedImage(transformedBase64);
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.transformImageBase64 = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var canvasRotation = this.canvasRotation + this.exifTransform.rotate;
        if (canvasRotation === 0 && !this.exifTransform.flip && !this.containWithinAspectRatio) {
            return this.originalBase64;
        }
        /** @type {?} */
        var transformedSize = this.getTransformedSize();
        /** @type {?} */
        var canvas = document.createElement('canvas');
        canvas.width = transformedSize.width;
        canvas.height = transformedSize.height;
        /** @type {?} */
        var ctx = canvas.getContext('2d');
        ctx.setTransform(this.exifTransform.flip ? -1 : 1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI * (canvasRotation / 2));
        ctx.drawImage(this.originalImage, -this.originalSize.width / 2, -this.originalSize.height / 2);
        return canvas.toDataURL();
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.getTransformedSize = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var canvasRotation = this.canvasRotation + this.exifTransform.rotate;
        if (this.containWithinAspectRatio) {
            if (canvasRotation % 2) {
                /** @type {?} */
                var minWidthToContain = this.originalSize.width * this.aspectRatio;
                /** @type {?} */
                var minHeightToContain = this.originalSize.height / this.aspectRatio;
                return {
                    width: Math.max(this.originalSize.height, minWidthToContain),
                    height: Math.max(this.originalSize.width, minHeightToContain),
                };
            }
            else {
                /** @type {?} */
                var minWidthToContain = this.originalSize.height * this.aspectRatio;
                /** @type {?} */
                var minHeightToContain = this.originalSize.width / this.aspectRatio;
                return {
                    width: Math.max(this.originalSize.width, minWidthToContain),
                    height: Math.max(this.originalSize.height, minHeightToContain),
                };
            }
        }
        if (canvasRotation % 2) {
            return {
                height: this.originalSize.width,
                width: this.originalSize.height,
            };
        }
        return {
            width: this.originalSize.width,
            height: this.originalSize.height,
        };
    };
    /**
     * @private
     * @param {?} transformedBase64
     * @return {?}
     */
    ImageCropperComponent.prototype.setTransformedImage = /**
     * @private
     * @param {?} transformedBase64
     * @return {?}
     */
    function (transformedBase64) {
        var _this = this;
        return new Promise((/**
         * @param {?} resolve
         * @return {?}
         */
        function (resolve) {
            _this.transformedBase64 = transformedBase64;
            _this.safeImgDataUrl = _this.sanitizer.bypassSecurityTrustResourceUrl(transformedBase64);
            _this.transformedImage = new Image();
            _this.transformedImage.onload = (/**
             * @return {?}
             */
            function () {
                _this.transformedSize.width = _this.transformedImage.naturalWidth;
                _this.transformedSize.height = _this.transformedImage.naturalHeight;
                _this.cd.markForCheck();
                resolve();
            });
            _this.transformedImage.src = _this.transformedBase64;
        }));
    };
    /**
     * @return {?}
     */
    ImageCropperComponent.prototype.imageLoadedInView = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.transformedImage != null) {
            this.imageLoaded.emit();
            this.setImageMaxSizeRetries = 0;
            setTimeout((/**
             * @return {?}
             */
            function () { return _this.checkImageMaxSizeRecursively(); }));
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.checkImageMaxSizeRecursively = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.setImageMaxSizeRetries > 40) {
            this.loadImageFailed.emit();
        }
        else if (this.sourceImageLoaded()) {
            this.setMaxSize();
            this.setCropperScaledMinSize();
            this.resetCropperPosition();
            this.cropperReady.emit(tslib_1.__assign({}, this.maxSize));
            this.cd.markForCheck();
        }
        else {
            this.setImageMaxSizeRetries++;
            setTimeout((/**
             * @return {?}
             */
            function () { return _this.checkImageMaxSizeRecursively(); }), 50);
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.sourceImageLoaded = /**
     * @private
     * @return {?}
     */
    function () {
        return this.sourceImage && this.sourceImage.nativeElement && this.sourceImage.nativeElement.offsetWidth > 0;
    };
    /**
     * @return {?}
     */
    ImageCropperComponent.prototype.onResize = /**
     * @return {?}
     */
    function () {
        this.resizeCropperPosition();
        this.setMaxSize();
        this.setCropperScaledMinSize();
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.activatePinchGesture = /**
     * @private
     * @return {?}
     */
    function () {
        if (this.Hammer) {
            /** @type {?} */
            var hammer = new this.Hammer(this.wrapper.nativeElement);
            hammer.get('pinch').set({ enable: true });
            hammer.on('pinchmove', this.onPinch.bind(this));
            hammer.on('pinchend', this.pinchStop.bind(this));
            hammer.on('pinchstart', this.startPinch.bind(this));
        }
        else if (isDevMode()) {
            console.warn('[NgxImageCropper] Could not find HammerJS - Pinch Gesture won\'t work');
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.resizeCropperPosition = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var sourceImageElement = this.sourceImage.nativeElement;
        if (this.maxSize.width !== sourceImageElement.offsetWidth || this.maxSize.height !== sourceImageElement.offsetHeight) {
            this.cropper.x1 = this.cropper.x1 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.x2 = this.cropper.x2 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.y1 = this.cropper.y1 * sourceImageElement.offsetHeight / this.maxSize.height;
            this.cropper.y2 = this.cropper.y2 * sourceImageElement.offsetHeight / this.maxSize.height;
        }
    };
    /**
     * @return {?}
     */
    ImageCropperComponent.prototype.resetCropperPosition = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var sourceImageElement = this.sourceImage.nativeElement;
        if (!this.maintainAspectRatio) {
            this.cropper.x1 = 0;
            this.cropper.x2 = sourceImageElement.offsetWidth;
            this.cropper.y1 = 0;
            this.cropper.y2 = sourceImageElement.offsetHeight;
        }
        else if (sourceImageElement.offsetWidth / this.aspectRatio < sourceImageElement.offsetHeight) {
            this.cropper.x1 = 0;
            this.cropper.x2 = sourceImageElement.offsetWidth;
            /** @type {?} */
            var cropperHeight = sourceImageElement.offsetWidth / this.aspectRatio;
            this.cropper.y1 = (sourceImageElement.offsetHeight - cropperHeight) / 2;
            this.cropper.y2 = this.cropper.y1 + cropperHeight;
        }
        else {
            this.cropper.y1 = 0;
            this.cropper.y2 = sourceImageElement.offsetHeight;
            /** @type {?} */
            var cropperWidth = sourceImageElement.offsetHeight * this.aspectRatio;
            this.cropper.x1 = (sourceImageElement.offsetWidth - cropperWidth) / 2;
            this.cropper.x2 = this.cropper.x1 + cropperWidth;
        }
        this.doAutoCrop();
        this.imageVisible = true;
    };
    /**
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.keyboardAccess = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.changeKeyboardStepSize(event);
        this.keyboardMoveCropper(event);
    };
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.changeKeyboardStepSize = /**
     * @private
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (event.key >= '1' && event.key <= '9') {
            this.stepSize = +event.key;
            return;
        }
    };
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.keyboardMoveCropper = /**
     * @private
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var keyboardWhiteList = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
        if (!(keyboardWhiteList.includes(event.key))) {
            return;
        }
        /** @type {?} */
        var moveType = event.shiftKey ? MoveTypes.Resize : MoveTypes.Move;
        /** @type {?} */
        var position = event.altKey ? this.getInvertedPositionForKey(event.key) : this.getPositionForKey(event.key);
        /** @type {?} */
        var moveEvent = this.getEventForKey(event.key, this.stepSize);
        event.preventDefault();
        event.stopPropagation();
        this.startMove({ clientX: 0, clientY: 0 }, moveType, position);
        this.moveImg(moveEvent);
        this.moveStop();
    };
    /**
     * @private
     * @param {?} key
     * @return {?}
     */
    ImageCropperComponent.prototype.getPositionForKey = /**
     * @private
     * @param {?} key
     * @return {?}
     */
    function (key) {
        switch (key) {
            case 'ArrowUp':
                return 'top';
            case 'ArrowRight':
                return 'right';
            case 'ArrowDown':
                return 'bottom';
            case 'ArrowLeft':
            default:
                return 'left';
        }
    };
    /**
     * @private
     * @param {?} key
     * @return {?}
     */
    ImageCropperComponent.prototype.getInvertedPositionForKey = /**
     * @private
     * @param {?} key
     * @return {?}
     */
    function (key) {
        switch (key) {
            case 'ArrowUp':
                return 'bottom';
            case 'ArrowRight':
                return 'left';
            case 'ArrowDown':
                return 'top';
            case 'ArrowLeft':
            default:
                return 'right';
        }
    };
    /**
     * @private
     * @param {?} key
     * @param {?} stepSize
     * @return {?}
     */
    ImageCropperComponent.prototype.getEventForKey = /**
     * @private
     * @param {?} key
     * @param {?} stepSize
     * @return {?}
     */
    function (key, stepSize) {
        switch (key) {
            case 'ArrowUp':
                return { clientX: 0, clientY: stepSize * -1 };
            case 'ArrowRight':
                return { clientX: stepSize, clientY: 0 };
            case 'ArrowDown':
                return { clientX: 0, clientY: stepSize };
            case 'ArrowLeft':
            default:
                return { clientX: stepSize * -1, clientY: 0 };
        }
    };
    /**
     * @param {?} event
     * @param {?} moveType
     * @param {?=} position
     * @return {?}
     */
    ImageCropperComponent.prototype.startMove = /**
     * @param {?} event
     * @param {?} moveType
     * @param {?=} position
     * @return {?}
     */
    function (event, moveType, position) {
        if (position === void 0) { position = null; }
        if (this.moveStart && this.moveStart.active && this.moveStart.type === MoveTypes.Pinch) {
            return;
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        this.moveStart = tslib_1.__assign({ active: true, type: moveType, position: position, clientX: this.getClientX(event), clientY: this.getClientY(event) }, this.cropper);
    };
    /**
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.startPinch = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (!this.safeImgDataUrl) {
            return;
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        this.moveStart = tslib_1.__assign({ active: true, type: MoveTypes.Pinch, position: 'center', clientX: this.cropper.x1 + (this.cropper.x2 - this.cropper.x1) / 2, clientY: this.cropper.y1 + (this.cropper.y2 - this.cropper.y1) / 2 }, this.cropper);
    };
    /**
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.moveImg = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (this.moveStart.active) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            if (this.moveStart.type === MoveTypes.Move) {
                this.move(event);
                this.checkCropperPosition(true);
            }
            else if (this.moveStart.type === MoveTypes.Resize) {
                this.resize(event);
                this.checkCropperPosition(false);
            }
            this.cd.detectChanges();
        }
    };
    /**
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.onPinch = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (this.moveStart.active) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            if (this.moveStart.type === MoveTypes.Pinch) {
                this.resize(event);
                this.checkCropperPosition(false);
            }
            this.cd.detectChanges();
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.setMaxSize = /**
     * @private
     * @return {?}
     */
    function () {
        if (this.sourceImage) {
            /** @type {?} */
            var sourceImageElement = this.sourceImage.nativeElement;
            this.maxSize.width = sourceImageElement.offsetWidth;
            this.maxSize.height = sourceImageElement.offsetHeight;
            this.marginLeft = this.sanitizer.bypassSecurityTrustStyle('calc(50% - ' + this.maxSize.width / 2 + 'px)');
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.setCropperScaledMinSize = /**
     * @private
     * @return {?}
     */
    function () {
        if (this.transformedImage) {
            this.setCropperScaledMinWidth();
            this.setCropperScaledMinHeight();
        }
        else {
            this.cropperScaledMinWidth = 20;
            this.cropperScaledMinHeight = 20;
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.setCropperScaledMinWidth = /**
     * @private
     * @return {?}
     */
    function () {
        this.cropperScaledMinWidth = this.cropperMinWidth > 0
            ? Math.max(20, this.cropperMinWidth / this.transformedImage.width * this.maxSize.width)
            : 20;
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.setCropperScaledMinHeight = /**
     * @private
     * @return {?}
     */
    function () {
        if (this.maintainAspectRatio) {
            this.cropperScaledMinHeight = Math.max(20, this.cropperScaledMinWidth / this.aspectRatio);
        }
        else if (this.cropperMinHeight > 0) {
            this.cropperScaledMinHeight = Math.max(20, this.cropperMinHeight / this.transformedImage.height * this.maxSize.height);
        }
        else {
            this.cropperScaledMinHeight = 20;
        }
    };
    /**
     * @private
     * @param {?=} maintainSize
     * @return {?}
     */
    ImageCropperComponent.prototype.checkCropperPosition = /**
     * @private
     * @param {?=} maintainSize
     * @return {?}
     */
    function (maintainSize) {
        if (maintainSize === void 0) { maintainSize = false; }
        if (this.cropper.x1 < 0) {
            this.cropper.x2 -= maintainSize ? this.cropper.x1 : 0;
            this.cropper.x1 = 0;
        }
        if (this.cropper.y1 < 0) {
            this.cropper.y2 -= maintainSize ? this.cropper.y1 : 0;
            this.cropper.y1 = 0;
        }
        if (this.cropper.x2 > this.maxSize.width) {
            this.cropper.x1 -= maintainSize ? (this.cropper.x2 - this.maxSize.width) : 0;
            this.cropper.x2 = this.maxSize.width;
        }
        if (this.cropper.y2 > this.maxSize.height) {
            this.cropper.y1 -= maintainSize ? (this.cropper.y2 - this.maxSize.height) : 0;
            this.cropper.y2 = this.maxSize.height;
        }
    };
    /**
     * @return {?}
     */
    ImageCropperComponent.prototype.moveStop = /**
     * @return {?}
     */
    function () {
        if (this.moveStart.active) {
            this.moveStart.active = false;
            this.doAutoCrop();
        }
    };
    /**
     * @return {?}
     */
    ImageCropperComponent.prototype.pinchStop = /**
     * @return {?}
     */
    function () {
        if (this.moveStart.active) {
            this.moveStart.active = false;
            this.doAutoCrop();
        }
    };
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.move = /**
     * @private
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var diffX = this.getClientX(event) - this.moveStart.clientX;
        /** @type {?} */
        var diffY = this.getClientY(event) - this.moveStart.clientY;
        this.cropper.x1 = this.moveStart.x1 + diffX;
        this.cropper.y1 = this.moveStart.y1 + diffY;
        this.cropper.x2 = this.moveStart.x2 + diffX;
        this.cropper.y2 = this.moveStart.y2 + diffY;
    };
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.resize = /**
     * @private
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var diffX = this.getClientX(event) - this.moveStart.clientX;
        /** @type {?} */
        var diffY = this.getClientY(event) - this.moveStart.clientY;
        switch (this.moveStart.position) {
            case 'left':
                this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                break;
            case 'topleft':
                this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                break;
            case 'top':
                this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                break;
            case 'topright':
                this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                break;
            case 'right':
                this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                break;
            case 'bottomright':
                this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                break;
            case 'bottom':
                this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                break;
            case 'bottomleft':
                this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                break;
            case 'center':
                /** @type {?} */
                var scale = event.scale;
                /** @type {?} */
                var newWidth = (Math.abs(this.moveStart.x2 - this.moveStart.x1)) * scale;
                /** @type {?} */
                var newHeight = (Math.abs(this.moveStart.y2 - this.moveStart.y1)) * scale;
                /** @type {?} */
                var x1 = this.cropper.x1;
                /** @type {?} */
                var y1 = this.cropper.y1;
                this.cropper.x1 = Math.min(this.moveStart.clientX - (newWidth / 2), this.cropper.x2 - this.cropperScaledMinWidth);
                this.cropper.y1 = Math.min(this.moveStart.clientY - (newHeight / 2), this.cropper.y2 - this.cropperScaledMinHeight);
                this.cropper.x2 = Math.max(this.moveStart.clientX + (newWidth / 2), x1 + this.cropperScaledMinWidth);
                this.cropper.y2 = Math.max(this.moveStart.clientY + (newHeight / 2), y1 + this.cropperScaledMinHeight);
                break;
        }
        if (this.maintainAspectRatio) {
            this.checkAspectRatio();
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.checkAspectRatio = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var overflowX = 0;
        /** @type {?} */
        var overflowY = 0;
        switch (this.moveStart.position) {
            case 'top':
                this.cropper.x2 = this.cropper.x1 + (this.cropper.y2 - this.cropper.y1) * this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(0 - this.cropper.y1, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'bottom':
                this.cropper.x2 = this.cropper.x1 + (this.cropper.y2 - this.cropper.y1) * this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : (overflowX / this.aspectRatio);
                }
                break;
            case 'topleft':
                this.cropper.y1 = this.cropper.y2 - (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(0 - this.cropper.x1, 0);
                overflowY = Math.max(0 - this.cropper.y1, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x1 += (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'topright':
                this.cropper.y1 = this.cropper.y2 - (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(0 - this.cropper.y1, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'right':
            case 'bottomright':
                this.cropper.y2 = this.cropper.y1 + (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'left':
            case 'bottomleft':
                this.cropper.y2 = this.cropper.y1 + (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(0 - this.cropper.x1, 0);
                overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x1 += (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'center':
                this.cropper.x2 = this.cropper.x1 + (this.cropper.y2 - this.cropper.y1) * this.aspectRatio;
                this.cropper.y2 = this.cropper.y1 + (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                /** @type {?} */
                var overflowX1 = Math.max(0 - this.cropper.x1, 0);
                /** @type {?} */
                var overflowX2 = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                /** @type {?} */
                var overflowY1 = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                /** @type {?} */
                var overflowY2 = Math.max(0 - this.cropper.y1, 0);
                if (overflowX1 > 0 || overflowX2 > 0 || overflowY1 > 0 || overflowY2 > 0) {
                    this.cropper.x1 += (overflowY1 * this.aspectRatio) > overflowX1 ? (overflowY1 * this.aspectRatio) : overflowX1;
                    this.cropper.x2 -= (overflowY2 * this.aspectRatio) > overflowX2 ? (overflowY2 * this.aspectRatio) : overflowX2;
                    this.cropper.y1 += (overflowY2 * this.aspectRatio) > overflowX2 ? overflowY2 : overflowX2 / this.aspectRatio;
                    this.cropper.y2 -= (overflowY1 * this.aspectRatio) > overflowX1 ? overflowY1 : overflowX1 / this.aspectRatio;
                }
                break;
        }
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.doAutoCrop = /**
     * @private
     * @return {?}
     */
    function () {
        if (this.autoCrop) {
            this.crop();
        }
    };
    /**
     * @return {?}
     */
    ImageCropperComponent.prototype.crop = /**
     * @return {?}
     */
    function () {
        if (this.sourceImage && this.sourceImage.nativeElement && this.transformedImage != null) {
            this.startCropImage.emit();
            /** @type {?} */
            var imagePosition = this.getImagePosition();
            /** @type {?} */
            var width = imagePosition.x2 - imagePosition.x1;
            /** @type {?} */
            var height = imagePosition.y2 - imagePosition.y1;
            /** @type {?} */
            var cropCanvas = (/** @type {?} */ (document.createElement('canvas')));
            cropCanvas.width = width;
            cropCanvas.height = height;
            /** @type {?} */
            var ctx = cropCanvas.getContext('2d');
            if (ctx) {
                if (this.backgroundColor != null) {
                    ctx.fillStyle = this.backgroundColor;
                    ctx.fillRect(0, 0, width, height);
                }
                /** @type {?} */
                var scaleX = (this.transform.scale || 1) * (this.transform.flipH ? -1 : 1);
                /** @type {?} */
                var scaleY = (this.transform.scale || 1) * (this.transform.flipV ? -1 : 1);
                ctx.setTransform(scaleX, 0, 0, scaleY, this.transformedSize.width / 2, this.transformedSize.height / 2);
                ctx.translate(-imagePosition.x1 / scaleX, -imagePosition.y1 / scaleY);
                ctx.rotate((this.transform.rotate || 0) * Math.PI / 180);
                ctx.drawImage(this.transformedImage, -this.transformedSize.width / 2, -this.transformedSize.height / 2);
                /** @type {?} */
                var output = {
                    width: width, height: height,
                    imagePosition: imagePosition,
                    cropperPosition: tslib_1.__assign({}, this.cropper)
                };
                if (this.containWithinAspectRatio) {
                    output.offsetImagePosition = this.getOffsetImagePosition();
                }
                /** @type {?} */
                var resizeRatio = this.getResizeRatio(width, height);
                if (resizeRatio !== 1) {
                    output.width = Math.round(width * resizeRatio);
                    output.height = this.maintainAspectRatio
                        ? Math.round(output.width / this.aspectRatio)
                        : Math.round(height * resizeRatio);
                    resizeCanvas(cropCanvas, output.width, output.height);
                }
                output.base64 = this.cropToBase64(cropCanvas);
                this.imageCropped.emit(output);
                return output;
            }
        }
        return null;
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.getImagePosition = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var sourceImageElement = this.sourceImage.nativeElement;
        /** @type {?} */
        var ratio = this.transformedSize.width / sourceImageElement.offsetWidth;
        /** @type {?} */
        var out = {
            x1: Math.round(this.cropper.x1 * ratio),
            y1: Math.round(this.cropper.y1 * ratio),
            x2: Math.round(this.cropper.x2 * ratio),
            y2: Math.round(this.cropper.y2 * ratio)
        };
        if (!this.containWithinAspectRatio) {
            out.x1 = Math.max(out.x1, 0);
            out.y1 = Math.max(out.y1, 0);
            out.x2 = Math.min(out.x2, this.transformedSize.width);
            out.y2 = Math.min(out.y2, this.transformedSize.height);
        }
        return out;
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.getOffsetImagePosition = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var canvasRotation = this.canvasRotation + this.exifTransform.rotate;
        /** @type {?} */
        var sourceImageElement = this.sourceImage.nativeElement;
        /** @type {?} */
        var ratio = this.transformedSize.width / sourceImageElement.offsetWidth;
        /** @type {?} */
        var offsetX;
        /** @type {?} */
        var offsetY;
        if (canvasRotation % 2) {
            offsetX = (this.transformedSize.width - this.originalSize.height) / 2;
            offsetY = (this.transformedSize.height - this.originalSize.width) / 2;
        }
        else {
            offsetX = (this.transformedSize.width - this.originalSize.width) / 2;
            offsetY = (this.transformedSize.height - this.originalSize.height) / 2;
        }
        /** @type {?} */
        var out = {
            x1: Math.round(this.cropper.x1 * ratio) - offsetX,
            y1: Math.round(this.cropper.y1 * ratio) - offsetY,
            x2: Math.round(this.cropper.x2 * ratio) - offsetX,
            y2: Math.round(this.cropper.y2 * ratio) - offsetY
        };
        if (!this.containWithinAspectRatio) {
            out.x1 = Math.max(out.x1, 0);
            out.y1 = Math.max(out.y1, 0);
            out.x2 = Math.min(out.x2, this.transformedSize.width);
            out.y2 = Math.min(out.y2, this.transformedSize.height);
        }
        return out;
    };
    /**
     * @private
     * @param {?} cropCanvas
     * @return {?}
     */
    ImageCropperComponent.prototype.cropToBase64 = /**
     * @private
     * @param {?} cropCanvas
     * @return {?}
     */
    function (cropCanvas) {
        return cropCanvas.toDataURL('image/' + this.format, this.getQuality());
    };
    /**
     * @private
     * @return {?}
     */
    ImageCropperComponent.prototype.getQuality = /**
     * @private
     * @return {?}
     */
    function () {
        return Math.min(1, Math.max(0, this.imageQuality / 100));
    };
    /**
     * @private
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    ImageCropperComponent.prototype.getResizeRatio = /**
     * @private
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    function (width, height) {
        if (this.resizeToWidth > 0) {
            if (!this.onlyScaleDown || width > this.resizeToWidth) {
                return this.resizeToWidth / width;
            }
        }
        else if (this.resizeToHeight > 0) {
            if (!this.onlyScaleDown || height > this.resizeToHeight) {
                return this.resizeToHeight / height;
            }
        }
        return 1;
    };
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.getClientX = /**
     * @private
     * @param {?} event
     * @return {?}
     */
    function (event) {
        return (event.touches && event.touches[0] ? event.touches[0].clientX : event.clientX) || 0;
    };
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    ImageCropperComponent.prototype.getClientY = /**
     * @private
     * @param {?} event
     * @return {?}
     */
    function (event) {
        return (event.touches && event.touches[0] ? event.touches[0].clientY : event.clientY) || 0;
    };
    ImageCropperComponent.decorators = [
        { type: Component, args: [{
                    selector: 'image-cropper',
                    template: "<div [style.background]=\"imageVisible && backgroundColor\"\n     #wrapper\n>\n    <img\n      #sourceImage\n      class=\"source-image\"\n      *ngIf=\"safeImgDataUrl\"\n      [src]=\"safeImgDataUrl\"\n      [style.visibility]=\"imageVisible ? 'visible' : 'hidden'\"\n      [style.transform]=\"safeTransformStyle\"\n      (load)=\"imageLoadedInView()\"\n    />\n    <div\n        class=\"overlay\"\n        [style.width.px]=\"maxSize.width\"\n        [style.height.px]=\"maxSize.height\"\n        [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\"\n    ></div>\n    <div class=\"cropper\"\n         *ngIf=\"imageVisible\"\n         [class.rounded]=\"roundCropper\"\n         [style.top.px]=\"cropper.y1\"\n         [style.left.px]=\"cropper.x1\"\n         [style.width.px]=\"cropper.x2 - cropper.x1\"\n         [style.height.px]=\"cropper.y2 - cropper.y1\"\n         [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\"\n         [style.visibility]=\"imageVisible ? 'visible' : 'hidden'\"\n         (keydown)=\"keyboardAccess($event)\"\n         tabindex=\"0\"\n    >\n        <div\n            (mousedown)=\"startMove($event, moveTypes.Move)\"\n            (touchstart)=\"startMove($event, moveTypes.Move)\"\n            class=\"move\">\n        </div>\n        <ng-container *ngIf=\"!hideResizeSquares\">\n            <span class=\"resize topleft\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'topleft')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'topleft')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize top\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize topright\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'topright')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'topright')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize right\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize bottomright\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'bottomright')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'bottomright')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize bottom\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize bottomleft\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'bottomleft')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'bottomleft')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize left\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize-bar top\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'top')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'top')\">\n            </span>\n            <span class=\"resize-bar right\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'right')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'right')\">\n            </span>\n            <span class=\"resize-bar bottom\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'bottom')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'bottom')\">\n            </span>\n            <span class=\"resize-bar left\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'left')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'left')\">\n            </span>\n        </ng-container>\n    </div>\n</div>\n",
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    styles: [":host{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center}:host>div{width:100%;position:relative}:host>div img.source-image{max-width:100%;max-height:100%;transform-origin:center}:host .overlay{position:absolute;pointer-events:none;touch-action:none;outline:var(--cropper-overlay-color,#fff) solid 100vw;top:0;left:0}:host .cropper{position:absolute;display:flex;color:#53535c;background:0 0;outline:rgba(255,255,255,.3) solid 100vw;outline:var(--cropper-outline-color,rgba(255,255,255,.3)) solid 100vw;touch-action:none}:host .cropper:after{position:absolute;content:\"\";top:0;bottom:0;left:0;right:0;pointer-events:none;border:1px dashed;opacity:.75;color:inherit;z-index:1}:host .cropper .move{width:100%;cursor:move;border:1px solid rgba(255,255,255,.5)}:host .cropper:focus .move{border-color:#1e90ff;border-width:2px}:host .cropper .resize{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}:host .cropper .resize .square{display:inline-block;background:#53535c;width:6px;height:6px;border:1px solid rgba(255,255,255,.5);box-sizing:content-box}:host .cropper .resize.topleft{top:-12px;left:-12px;cursor:nwse-resize}:host .cropper .resize.top{top:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.topright{top:-12px;right:-12px;cursor:nesw-resize}:host .cropper .resize.right{top:calc(50% - 12px);right:-12px;cursor:ew-resize}:host .cropper .resize.bottomright{bottom:-12px;right:-12px;cursor:nwse-resize}:host .cropper .resize.bottom{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.bottomleft{bottom:-12px;left:-12px;cursor:nesw-resize}:host .cropper .resize.left{top:calc(50% - 12px);left:-12px;cursor:ew-resize}:host .cropper .resize-bar{position:absolute;z-index:1}:host .cropper .resize-bar.top{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.right{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper .resize-bar.bottom{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.left{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper.rounded{outline-color:transparent}:host .cropper.rounded:after{border-radius:100%;box-shadow:0 0 0 100vw rgba(255,255,255,.3);box-shadow:0 0 0 100vw var(--cropper-outline-color,rgba(255,255,255,.3))}@media (orientation:portrait){:host .cropper{outline-width:100vh}:host .cropper.rounded:after{box-shadow:0 0 0 100vh rgba(255,255,255,.3);box-shadow:0 0 0 100vh var(--cropper-outline-color,rgba(255,255,255,.3))}}:host .cropper.rounded .move{border-radius:100%}:host.disabled .cropper .move,:host.disabled .cropper .resize,:host.disabled .cropper .resize-bar{display:none}"]
                }] }
    ];
    /** @nocollapse */
    ImageCropperComponent.ctorParameters = function () { return [
        { type: DomSanitizer },
        { type: ChangeDetectorRef }
    ]; };
    ImageCropperComponent.propDecorators = {
        wrapper: [{ type: ViewChild, args: ['wrapper', { static: true },] }],
        sourceImage: [{ type: ViewChild, args: ['sourceImage', { static: false },] }],
        imageChangedEvent: [{ type: Input }],
        imageURL: [{ type: Input }],
        imageBase64: [{ type: Input }],
        imageFile: [{ type: Input }],
        format: [{ type: Input }],
        maintainAspectRatio: [{ type: Input }],
        transform: [{ type: Input }],
        aspectRatio: [{ type: Input }],
        resizeToWidth: [{ type: Input }],
        resizeToHeight: [{ type: Input }],
        cropperMinWidth: [{ type: Input }],
        cropperMinHeight: [{ type: Input }],
        canvasRotation: [{ type: Input }],
        initialStepSize: [{ type: Input }],
        roundCropper: [{ type: Input }],
        onlyScaleDown: [{ type: Input }],
        imageQuality: [{ type: Input }],
        autoCrop: [{ type: Input }],
        backgroundColor: [{ type: Input }],
        containWithinAspectRatio: [{ type: Input }],
        hideResizeSquares: [{ type: Input }],
        cropper: [{ type: Input }],
        alignImage: [{ type: HostBinding, args: ['style.text-align',] }, { type: Input }],
        disabled: [{ type: HostBinding, args: ['class.disabled',] }, { type: Input }],
        imageCropped: [{ type: Output }],
        startCropImage: [{ type: Output }],
        imageLoaded: [{ type: Output }],
        cropperReady: [{ type: Output }],
        loadImageFailed: [{ type: Output }],
        onResize: [{ type: HostListener, args: ['window:resize',] }],
        moveImg: [{ type: HostListener, args: ['document:mousemove', ['$event'],] }, { type: HostListener, args: ['document:touchmove', ['$event'],] }],
        moveStop: [{ type: HostListener, args: ['document:mouseup',] }, { type: HostListener, args: ['document:touchend',] }]
    };
    return ImageCropperComponent;
}());
export { ImageCropperComponent };
if (false) {
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.Hammer;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.originalImage;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.transformedImage;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.originalBase64;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.transformedBase64;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.moveStart;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.originalSize;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.transformedSize;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.setImageMaxSizeRetries;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.cropperScaledMinWidth;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.cropperScaledMinHeight;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.exifTransform;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.autoRotateSupported;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.stepSize;
    /** @type {?} */
    ImageCropperComponent.prototype.safeImgDataUrl;
    /** @type {?} */
    ImageCropperComponent.prototype.safeTransformStyle;
    /** @type {?} */
    ImageCropperComponent.prototype.marginLeft;
    /** @type {?} */
    ImageCropperComponent.prototype.maxSize;
    /** @type {?} */
    ImageCropperComponent.prototype.imageVisible;
    /** @type {?} */
    ImageCropperComponent.prototype.moveTypes;
    /** @type {?} */
    ImageCropperComponent.prototype.wrapper;
    /** @type {?} */
    ImageCropperComponent.prototype.sourceImage;
    /** @type {?} */
    ImageCropperComponent.prototype.imageChangedEvent;
    /** @type {?} */
    ImageCropperComponent.prototype.imageURL;
    /** @type {?} */
    ImageCropperComponent.prototype.imageBase64;
    /** @type {?} */
    ImageCropperComponent.prototype.imageFile;
    /** @type {?} */
    ImageCropperComponent.prototype.format;
    /** @type {?} */
    ImageCropperComponent.prototype.maintainAspectRatio;
    /** @type {?} */
    ImageCropperComponent.prototype.transform;
    /** @type {?} */
    ImageCropperComponent.prototype.aspectRatio;
    /** @type {?} */
    ImageCropperComponent.prototype.resizeToWidth;
    /** @type {?} */
    ImageCropperComponent.prototype.resizeToHeight;
    /** @type {?} */
    ImageCropperComponent.prototype.cropperMinWidth;
    /** @type {?} */
    ImageCropperComponent.prototype.cropperMinHeight;
    /** @type {?} */
    ImageCropperComponent.prototype.canvasRotation;
    /** @type {?} */
    ImageCropperComponent.prototype.initialStepSize;
    /** @type {?} */
    ImageCropperComponent.prototype.roundCropper;
    /** @type {?} */
    ImageCropperComponent.prototype.onlyScaleDown;
    /** @type {?} */
    ImageCropperComponent.prototype.imageQuality;
    /** @type {?} */
    ImageCropperComponent.prototype.autoCrop;
    /** @type {?} */
    ImageCropperComponent.prototype.backgroundColor;
    /** @type {?} */
    ImageCropperComponent.prototype.containWithinAspectRatio;
    /** @type {?} */
    ImageCropperComponent.prototype.hideResizeSquares;
    /** @type {?} */
    ImageCropperComponent.prototype.cropper;
    /** @type {?} */
    ImageCropperComponent.prototype.alignImage;
    /** @type {?} */
    ImageCropperComponent.prototype.disabled;
    /** @type {?} */
    ImageCropperComponent.prototype.imageCropped;
    /** @type {?} */
    ImageCropperComponent.prototype.startCropImage;
    /** @type {?} */
    ImageCropperComponent.prototype.imageLoaded;
    /** @type {?} */
    ImageCropperComponent.prototype.cropperReady;
    /** @type {?} */
    ImageCropperComponent.prototype.loadImageFailed;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.sanitizer;
    /**
     * @type {?}
     * @private
     */
    ImageCropperComponent.prototype.cd;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci8iLCJzb3VyY2VzIjpbImxpYi9jb21wb25lbnQvaW1hZ2UtY3JvcHBlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQ0gsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixXQUFXLEVBQ1gsWUFBWSxFQUNaLEtBQUssRUFDTCxTQUFTLEVBR1QsTUFBTSxFQUVOLFNBQVMsRUFDWixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsWUFBWSxFQUFzQixNQUFNLDJCQUEyQixDQUFDO0FBRTdFLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2hHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUdyRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFL0Q7SUF5RUksK0JBQW9CLFNBQXVCLEVBQ3ZCLEVBQXFCO1FBRHJCLGNBQVMsR0FBVCxTQUFTLENBQWM7UUFDdkIsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFuRWpDLFdBQU0sR0FBaUIsT0FBTyxNQUFNLEtBQUssV0FBVztZQUN4RCxDQUFDLENBQUMsbUJBQUEsQ0FBQyxtQkFBQSxNQUFNLEVBQU8sQ0FBQyxDQUFDLE1BQU0sRUFBZ0I7WUFDeEMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQVFILDJCQUFzQixHQUFHLENBQUMsQ0FBQztRQUMzQiwwQkFBcUIsR0FBRyxFQUFFLENBQUM7UUFDM0IsMkJBQXNCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLGtCQUFhLEdBQWtCLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7UUFDeEQsd0JBQW1CLEdBQXFCLHlCQUF5QixF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LEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3JHLE1BQU07WUFDVixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3BHLE1BQU07WUFDVixLQUFLLGFBQWE7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3BHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNO1lBQ1YsS0FBSyxRQUFRO2dCQUNULElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNO1lBQ1YsS0FBSyxZQUFZO2dCQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMs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QyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7O29CQUNyRixVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztvQkFDN0MsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDOztvQkFDOUQsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDOztvQkFDL0QsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFO29CQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDL0csSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7b0JBQy9HLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FB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Q3BCLDZDQUFxQjs7SUFDckIsMENBQXNCOztJQUV0Qix3Q0FBMEQ7O0lBQzFELDRDQUFtRTs7SUFFbkUsa0RBQWdDOztJQUNoQyx5Q0FBMEI7O0lBQzFCLDRDQUE2Qjs7SUFDN0IsMENBQXlCOztJQUV6Qix1Q0FBaUU7O0lBQ2pFLG9EQUFvQzs7SUFDcEMsMENBQXdDOztJQUN4Qyw0Q0FBeUI7O0lBQ3pCLDhDQUEyQjs7SUFDM0IsK0NBQTRCOztJQUM1QixnREFBNkI7O0lBQzdCLGlEQUE4Qjs7SUFDOUIsK0NBQTRCOztJQUM1QixnREFBNkI7O0lBQzdCLDZDQUE4Qjs7SUFDOUIsOENBQStCOztJQUMvQiw2Q0FBMkI7O0lBQzNCLHlDQUF5Qjs7SUFDekIsZ0RBQWlDOztJQUNqQyx5REFBMEM7O0lBQzFDLGtEQUFtQzs7SUFDbkMsd0NBS0U7O0lBQ0YsMkNBQ2tEOztJQUNsRCx5Q0FDMEI7O0lBRTFCLDZDQUErRDs7SUFDL0QsK0NBQW9EOztJQUNwRCw0Q0FBaUQ7O0lBQ2pELDZDQUF3RDs7SUFDeEQsZ0RBQXFEOzs7OztJQUV6QywwQ0FBK0I7Ozs7O0lBQy9CLG1DQUE2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQ29tcG9uZW50LFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIEhvc3RCaW5kaW5nLFxuICAgIEhvc3RMaXN0ZW5lcixcbiAgICBJbnB1dCxcbiAgICBpc0Rldk1vZGUsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uSW5pdCxcbiAgICBPdXRwdXQsXG4gICAgU2ltcGxlQ2hhbmdlcyxcbiAgICBWaWV3Q2hpbGRcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVTdHlsZSwgU2FmZVVybCB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgQ3JvcHBlclBvc2l0aW9uLCBEaW1lbnNpb25zLCBJbWFnZUNyb3BwZWRFdmVudCwgSW1hZ2VUcmFuc2Zvcm0sIE1vdmVTdGFydCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZ2V0VHJhbnNmb3JtYXRpb25zRnJvbUV4aWZEYXRhLCBzdXBwb3J0c0F1dG9tYXRpY1JvdGF0aW9uIH0gZnJvbSAnLi4vdXRpbHMvZXhpZi51dGlscyc7XG5pbXBvcnQgeyByZXNpemVDYW52YXMgfSBmcm9tICcuLi91dGlscy9yZXNpemUudXRpbHMnO1xuaW1wb3J0IHsgRXhpZlRyYW5zZm9ybSB9IGZyb20gJy4uL2ludGVyZmFjZXMvZXhpZi10cmFuc2Zvcm0uaW50ZXJmYWNlJztcbmltcG9ydCB7IEhhbW1lclN0YXRpYyB9IGZyb20gJy4uL3V0aWxzL2hhbW1lci51dGlscyc7XG5pbXBvcnQgeyBNb3ZlVHlwZXMgfSBmcm9tICcuLi9pbnRlcmZhY2VzL21vdmUtc3RhcnQuaW50ZXJmYWNlJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdpbWFnZS1jcm9wcGVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuc2NzcyddLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlQ3JvcHBlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0IHtcbiAgICBwcml2YXRlIEhhbW1lcjogSGFtbWVyU3RhdGljID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyAod2luZG93IGFzIGFueSkuSGFtbWVyIGFzIEhhbW1lclN0YXRpY1xuICAgICAgICA6IG51bGw7XG4gICAgcHJpdmF0ZSBvcmlnaW5hbEltYWdlOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbDtcbiAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBvcmlnaW5hbEJhc2U2NDogc3RyaW5nO1xuICAgIHByaXZhdGUgdHJhbnNmb3JtZWRCYXNlNjQ6IHN0cmluZztcbiAgICBwcml2YXRlIG1vdmVTdGFydDogTW92ZVN0YXJ0O1xuICAgIHByaXZhdGUgb3JpZ2luYWxTaXplOiBEaW1lbnNpb25zO1xuICAgIHByaXZhdGUgdHJhbnNmb3JtZWRTaXplOiBEaW1lbnNpb25zO1xuICAgIHByaXZhdGUgc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA9IDA7XG4gICAgcHJpdmF0ZSBjcm9wcGVyU2NhbGVkTWluV2lkdGggPSAyMDtcbiAgICBwcml2YXRlIGNyb3BwZXJTY2FsZWRNaW5IZWlnaHQgPSAyMDtcbiAgICBwcml2YXRlIGV4aWZUcmFuc2Zvcm06IEV4aWZUcmFuc2Zvcm0gPSB7cm90YXRlOiAwLCBmbGlwOiBmYWxzZX07XG4gICAgcHJpdmF0ZSBhdXRvUm90YXRlU3VwcG9ydGVkOiBQcm9taXNlPGJvb2xlYW4+ID0gc3VwcG9ydHNBdXRvbWF0aWNSb3RhdGlvbigpO1xuICAgIHByaXZhdGUgc3RlcFNpemUgPSAzO1xuXG4gICAgc2FmZUltZ0RhdGFVcmw6IFNhZmVVcmwgfCBzdHJpbmc7XG4gICAgc2FmZVRyYW5zZm9ybVN0eWxlOiBTYWZlU3R5bGUgfCBzdHJpbmc7XG4gICAgbWFyZ2luTGVmdDogU2FmZVN0eWxlIHwgc3RyaW5nID0gJzBweCc7XG4gICAgbWF4U2l6ZTogRGltZW5zaW9ucztcbiAgICBpbWFnZVZpc2libGUgPSBmYWxzZTtcbiAgICBtb3ZlVHlwZXMgPSBNb3ZlVHlwZXM7XG5cbiAgICBAVmlld0NoaWxkKCd3cmFwcGVyJywge3N0YXRpYzogdHJ1ZX0pIHdyYXBwZXI6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgnc291cmNlSW1hZ2UnLCB7c3RhdGljOiBmYWxzZX0pIHNvdXJjZUltYWdlOiBFbGVtZW50UmVmO1xuXG4gICAgQElucHV0KCkgaW1hZ2VDaGFuZ2VkRXZlbnQ6IGFueTtcbiAgICBASW5wdXQoKSBpbWFnZVVSTDogc3RyaW5nO1xuICAgIEBJbnB1dCgpIGltYWdlQmFzZTY0OiBzdHJpbmc7XG4gICAgQElucHV0KCkgaW1hZ2VGaWxlOiBGaWxlO1xuXG4gICAgQElucHV0KCkgZm9ybWF0OiAncG5nJyB8ICdqcGVnJyB8ICdibXAnIHwgJ3dlYnAnIHwgJ2ljbycgPSAncG5nJztcbiAgICBASW5wdXQoKSBtYWludGFpbkFzcGVjdFJhdGlvID0gdHJ1ZTtcbiAgICBASW5wdXQoKSB0cmFuc2Zvcm06IEltYWdlVHJhbnNmb3JtID0ge307XG4gICAgQElucHV0KCkgYXNwZWN0UmF0aW8gPSAxO1xuICAgIEBJbnB1dCgpIHJlc2l6ZVRvV2lkdGggPSAwO1xuICAgIEBJbnB1dCgpIHJlc2l6ZVRvSGVpZ2h0ID0gMDtcbiAgICBASW5wdXQoKSBjcm9wcGVyTWluV2lkdGggPSAwO1xuICAgIEBJbnB1dCgpIGNyb3BwZXJNaW5IZWlnaHQgPSAwO1xuICAgIEBJbnB1dCgpIGNhbnZhc1JvdGF0aW9uID0gMDtcbiAgICBASW5wdXQoKSBpbml0aWFsU3RlcFNpemUgPSAzO1xuICAgIEBJbnB1dCgpIHJvdW5kQ3JvcHBlciA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIG9ubHlTY2FsZURvd24gPSBmYWxzZTtcbiAgICBASW5wdXQoKSBpbWFnZVF1YWxpdHkgPSA5MjtcbiAgICBASW5wdXQoKSBhdXRvQ3JvcCA9IHRydWU7XG4gICAgQElucHV0KCkgYmFja2dyb3VuZENvbG9yOiBzdHJpbmc7XG4gICAgQElucHV0KCkgY29udGFpbldpdGhpbkFzcGVjdFJhdGlvID0gZmFsc2U7XG4gICAgQElucHV0KCkgaGlkZVJlc2l6ZVNxdWFyZXMgPSBmYWxzZTtcbiAgICBASW5wdXQoKSBjcm9wcGVyOiBDcm9wcGVyUG9zaXRpb24gPSB7XG4gICAgICAgIHgxOiAtMTAwLFxuICAgICAgICB5MTogLTEwMCxcbiAgICAgICAgeDI6IDEwMDAwLFxuICAgICAgICB5MjogMTAwMDBcbiAgICB9O1xuICAgIEBIb3N0QmluZGluZygnc3R5bGUudGV4dC1hbGlnbicpXG4gICAgQElucHV0KCkgYWxpZ25JbWFnZTogJ2xlZnQnIHwgJ2NlbnRlcicgPSAnY2VudGVyJztcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmRpc2FibGVkJylcbiAgICBASW5wdXQoKSBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgQE91dHB1dCgpIGltYWdlQ3JvcHBlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SW1hZ2VDcm9wcGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHN0YXJ0Q3JvcEltYWdlID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBpbWFnZUxvYWRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgY3JvcHBlclJlYWR5ID0gbmV3IEV2ZW50RW1pdHRlcjxEaW1lbnNpb25zPigpO1xuICAgIEBPdXRwdXQoKSBsb2FkSW1hZ2VGYWlsZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNhbml0aXplcjogRG9tU2FuaXRpemVyLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgICAgIHRoaXMuaW5pdENyb3BwZXIoKTtcbiAgICB9XG5cbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgICAgIHRoaXMub25DaGFuZ2VzSW5wdXRJbWFnZShjaGFuZ2VzKTtcblxuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEltYWdlICYmIHRoaXMub3JpZ2luYWxJbWFnZS5jb21wbGV0ZSAmJiB0aGlzLmV4aWZUcmFuc2Zvcm1cbiAgICAgICAgICAgICYmIChjaGFuZ2VzLmNvbnRhaW5XaXRoaW5Bc3BlY3RSYXRpbyB8fCBjaGFuZ2VzLmNhbnZhc1JvdGF0aW9uKSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1PcmlnaW5hbEltYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMuY3JvcHBlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlcy5hc3BlY3RSYXRpbyAmJiB0aGlzLmltYWdlVmlzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldENyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLnRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLnRyYW5zZm9ybSB8fCB7fTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q3NzVHJhbnNmb3JtKCk7XG4gICAgICAgICAgICB0aGlzLmRvQXV0b0Nyb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25DaGFuZ2VzSW5wdXRJbWFnZShjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgICAgIGlmIChjaGFuZ2VzLmltYWdlQ2hhbmdlZEV2ZW50IHx8IGNoYW5nZXMuaW1hZ2VVUkwgfHwgY2hhbmdlcy5pbWFnZUJhc2U2NCB8fCBjaGFuZ2VzLmltYWdlRmlsZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLmltYWdlQ2hhbmdlZEV2ZW50ICYmIHRoaXMuaXNWYWxpZEltYWdlQ2hhbmdlZEV2ZW50KCkpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRmlsZSh0aGlzLmltYWdlQ2hhbmdlZEV2ZW50LnRhcmdldC5maWxlc1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMuaW1hZ2VVUkwgJiYgdGhpcy5pbWFnZVVSTCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGcm9tVVJMKHRoaXMuaW1hZ2VVUkwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLmltYWdlQmFzZTY0ICYmIHRoaXMuaW1hZ2VCYXNlNjQpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEJhc2U2NEltYWdlKHRoaXMuaW1hZ2VCYXNlNjQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLmltYWdlRmlsZSAmJiB0aGlzLmltYWdlRmlsZSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKHRoaXMuaW1hZ2VGaWxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZEltYWdlQ2hhbmdlZEV2ZW50KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZUNoYW5nZWRFdmVudFxuICAgICAgICAgICAgJiYgdGhpcy5pbWFnZUNoYW5nZWRFdmVudC50YXJnZXRcbiAgICAgICAgICAgICYmIHRoaXMuaW1hZ2VDaGFuZ2VkRXZlbnQudGFyZ2V0LmZpbGVzXG4gICAgICAgICAgICAmJiB0aGlzLmltYWdlQ2hhbmdlZEV2ZW50LnRhcmdldC5maWxlcy5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0Q3NzVHJhbnNmb3JtKCkge1xuICAgICAgICB0aGlzLnNhZmVUcmFuc2Zvcm1TdHlsZSA9IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RTdHlsZShcbiAgICAgICAgICAgICdzY2FsZVgoJyArICh0aGlzLnRyYW5zZm9ybS5zY2FsZSB8fCAxKSAqICh0aGlzLnRyYW5zZm9ybS5mbGlwSCA/IC0xIDogMSkgKyAnKScgK1xuICAgICAgICAgICAgJ3NjYWxlWSgnICsgKHRoaXMudHJhbnNmb3JtLnNjYWxlIHx8IDEpICogKHRoaXMudHJhbnNmb3JtLmZsaXBWID8gLTEgOiAxKSArICcpJyArXG4gICAgICAgICAgICAncm90YXRlKCcgKyAodGhpcy50cmFuc2Zvcm0ucm90YXRlIHx8IDApICsgJ2RlZyknXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc3RlcFNpemUgPSB0aGlzLmluaXRpYWxTdGVwU2l6ZTtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVBpbmNoR2VzdHVyZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdENyb3BwZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc2FmZUltZ0RhdGFVcmwgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2cnXG4gICAgICAgICAgICArICdvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQUMwbEVRVlFZVjJOZ0FBSUFBQVUnXG4gICAgICAgICAgICArICdBQWFyVnlGRUFBQUFBU1VWT1JLNUNZSUk9JztcbiAgICAgICAgdGhpcy5tb3ZlU3RhcnQgPSB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogbnVsbCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgeDE6IDAsXG4gICAgICAgICAgICB5MTogMCxcbiAgICAgICAgICAgIHgyOiAwLFxuICAgICAgICAgICAgeTI6IDAsXG4gICAgICAgICAgICBjbGllbnRYOiAwLFxuICAgICAgICAgICAgY2xpZW50WTogMFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm1heFNpemUgPSB7XG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRTaXplID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gMTAwMDA7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MiA9IDEwMDAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZEltYWdlKGltYWdlQmFzZTY0OiBzdHJpbmcsIGltYWdlVHlwZTogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRJbWFnZVR5cGUoaW1hZ2VUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkQmFzZTY0SW1hZ2UoaW1hZ2VCYXNlNjQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGYWlsZWQuZW1pdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkSW1hZ2VGaWxlKGZpbGU6IEZpbGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gKGV2ZW50OiBhbnkpID0+IHRoaXMubG9hZEltYWdlKGV2ZW50LnRhcmdldC5yZXN1bHQsIGZpbGUudHlwZSk7XG4gICAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFsaWRJbWFnZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAvaW1hZ2VcXC8ocG5nfGpwZ3xqcGVnfGJtcHxnaWZ8dGlmZnx3ZWJwKS8udGVzdCh0eXBlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRCYXNlNjRJbWFnZShpbWFnZUJhc2U2NDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYXV0b1JvdGF0ZVN1cHBvcnRlZFxuICAgICAgICAgICAgLnRoZW4oKHN1cHBvcnRlZDogYm9vbGVhbikgPT4gdGhpcy5jaGVja0V4aWZBbmRMb2FkQmFzZTY0SW1hZ2UoaW1hZ2VCYXNlNjQsIHN1cHBvcnRlZCkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLnRyYW5zZm9ybU9yaWdpbmFsSW1hZ2UoKSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsQmFzZTY0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tFeGlmQW5kTG9hZEJhc2U2NEltYWdlKGltYWdlQmFzZTY0OiBzdHJpbmcsIGF1dG9Sb3RhdGVTdXBwb3J0ZWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsQmFzZTY0ID0gaW1hZ2VCYXNlNjQ7XG4gICAgICAgICAgICAgICAgdGhpcy5leGlmVHJhbnNmb3JtID0gZ2V0VHJhbnNmb3JtYXRpb25zRnJvbUV4aWZEYXRhKGF1dG9Sb3RhdGVTdXBwb3J0ZWQgPyAtMSA6IGltYWdlQmFzZTY0KTtcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCA9IHRoaXMub3JpZ2luYWxJbWFnZS5uYXR1cmFsV2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEltYWdlLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZS5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLnNyYyA9IGltYWdlQmFzZTY0O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRJbWFnZUZyb21VUkwodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4gdGhpcy5sb2FkSW1hZ2VGYWlsZWQuZW1pdCgpO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgICAgICB0aGlzLmxvYWRCYXNlNjRJbWFnZShjYW52YXMudG9EYXRhVVJMKCkpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSAnYW5vbnltb3VzJztcbiAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyYW5zZm9ybU9yaWdpbmFsSW1hZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICghdGhpcy5vcmlnaW5hbEltYWdlIHx8ICF0aGlzLm9yaWdpbmFsSW1hZ2UuY29tcGxldGUgfHwgIXRoaXMuZXhpZlRyYW5zZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTm8gaW1hZ2UgbG9hZGVkJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkQmFzZTY0ID0gdGhpcy50cmFuc2Zvcm1JbWFnZUJhc2U2NCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRUcmFuc2Zvcm1lZEltYWdlKHRyYW5zZm9ybWVkQmFzZTY0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyYW5zZm9ybUltYWdlQmFzZTY0KCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGNhbnZhc1JvdGF0aW9uID0gdGhpcy5jYW52YXNSb3RhdGlvbiArIHRoaXMuZXhpZlRyYW5zZm9ybS5yb3RhdGU7XG4gICAgICAgIGlmIChjYW52YXNSb3RhdGlvbiA9PT0gMCAmJiAhdGhpcy5leGlmVHJhbnNmb3JtLmZsaXAgJiYgIXRoaXMuY29udGFpbldpdGhpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbEJhc2U2NDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkU2l6ZSA9IHRoaXMuZ2V0VHJhbnNmb3JtZWRTaXplKCk7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMud2lkdGggPSB0cmFuc2Zvcm1lZFNpemUud2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSB0cmFuc2Zvcm1lZFNpemUuaGVpZ2h0O1xuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybShcbiAgICAgICAgICAgIHRoaXMuZXhpZlRyYW5zZm9ybS5mbGlwID8gLTEgOiAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgY2FudmFzLndpZHRoIC8gMixcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgLyAyXG4gICAgICAgICk7XG4gICAgICAgIGN0eC5yb3RhdGUoTWF0aC5QSSAqIChjYW52YXNSb3RhdGlvbiAvIDIpKTtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSxcbiAgICAgICAgICAgIC10aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCAvIDIsXG4gICAgICAgICAgICAtdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0IC8gMlxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VHJhbnNmb3JtZWRTaXplKCk6IERpbWVuc2lvbnMge1xuICAgICAgICBjb25zdCBjYW52YXNSb3RhdGlvbiA9IHRoaXMuY2FudmFzUm90YXRpb24gKyB0aGlzLmV4aWZUcmFuc2Zvcm0ucm90YXRlO1xuICAgICAgICBpZiAodGhpcy5jb250YWluV2l0aGluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIGlmIChjYW52YXNSb3RhdGlvbiAlIDIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaW5XaWR0aFRvQ29udGFpbiA9IHRoaXMub3JpZ2luYWxTaXplLndpZHRoICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBjb25zdCBtaW5IZWlnaHRUb0NvbnRhaW4gPSB0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBNYXRoLm1heCh0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQsIG1pbldpZHRoVG9Db250YWluKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heCh0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCwgbWluSGVpZ2h0VG9Db250YWluKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaW5XaWR0aFRvQ29udGFpbiA9IHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgY29uc3QgbWluSGVpZ2h0VG9Db250YWluID0gdGhpcy5vcmlnaW5hbFNpemUud2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBNYXRoLm1heCh0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCwgbWluV2lkdGhUb0NvbnRhaW4pLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCwgbWluSGVpZ2h0VG9Db250YWluKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbnZhc1JvdGF0aW9uICUgMikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3JpZ2luYWxTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vcmlnaW5hbFNpemUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFRyYW5zZm9ybWVkSW1hZ2UodHJhbnNmb3JtZWRCYXNlNjQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkQmFzZTY0ID0gdHJhbnNmb3JtZWRCYXNlNjQ7XG4gICAgICAgICAgICB0aGlzLnNhZmVJbWdEYXRhVXJsID0gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKHRyYW5zZm9ybWVkQmFzZTY0KTtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkU2l6ZS53aWR0aCA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZS5uYXR1cmFsV2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZFNpemUuaGVpZ2h0ID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlLnNyYyA9IHRoaXMudHJhbnNmb3JtZWRCYXNlNjQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGltYWdlTG9hZGVkSW5WaWV3KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy50cmFuc2Zvcm1lZEltYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VMb2FkZWQuZW1pdCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzID0gMDtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jaGVja0ltYWdlTWF4U2l6ZVJlY3Vyc2l2ZWx5KCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0ltYWdlTWF4U2l6ZVJlY3Vyc2l2ZWx5KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzID4gNDApIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRmFpbGVkLmVtaXQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNvdXJjZUltYWdlTG9hZGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy5yZXNldENyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyUmVhZHkuZW1pdCh7Li4udGhpcy5tYXhTaXplfSk7XG4gICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpLCA1MCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNvdXJjZUltYWdlTG9hZGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VJbWFnZSAmJiB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoID4gMDtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJylcbiAgICBvblJlc2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5yZXNpemVDcm9wcGVyUG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgIHRoaXMuc2V0Q3JvcHBlclNjYWxlZE1pblNpemUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFjdGl2YXRlUGluY2hHZXN0dXJlKCkge1xuICAgICAgICBpZiAodGhpcy5IYW1tZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbW1lciA9IG5ldyB0aGlzLkhhbW1lcih0aGlzLndyYXBwZXIubmF0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICBoYW1tZXIuZ2V0KCdwaW5jaCcpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG4gICAgICAgICAgICBoYW1tZXIub24oJ3BpbmNobW92ZScsdGhpcy5vblBpbmNoLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgaGFtbWVyLm9uKCdwaW5jaGVuZCcsdGhpcy5waW5jaFN0b3AuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBoYW1tZXIub24oJ3BpbmNoc3RhcnQnLHRoaXMuc3RhcnRQaW5jaC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbTmd4SW1hZ2VDcm9wcGVyXSBDb3VsZCBub3QgZmluZCBIYW1tZXJKUyAtIFBpbmNoIEdlc3R1cmUgd29uXFwndCB3b3JrJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZUNyb3BwZXJQb3NpdGlvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBpZiAodGhpcy5tYXhTaXplLndpZHRoICE9PSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggfHwgdGhpcy5tYXhTaXplLmhlaWdodCAhPT0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gdGhpcy5jcm9wcGVyLngxICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5tYXhTaXplLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngyICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5tYXhTaXplLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5jcm9wcGVyLnkxICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAvIHRoaXMubWF4U2l6ZS5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTIgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gdGhpcy5tYXhTaXplLmhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0Q3JvcHBlclBvc2l0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmICghdGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbyA8IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb25zdCBjcm9wcGVySGVpZ2h0ID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gY3JvcHBlckhlaWdodCkgLyAyO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgY3JvcHBlckhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgY3JvcHBlcldpZHRoID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC0gY3JvcHBlcldpZHRoKSAvIDI7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyBjcm9wcGVyV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBrZXlib2FyZEFjY2VzcyhldmVudDogYW55KSB7XG4gICAgICAgIHRoaXMuY2hhbmdlS2V5Ym9hcmRTdGVwU2l6ZShldmVudCk7XG4gICAgICAgIHRoaXMua2V5Ym9hcmRNb3ZlQ3JvcHBlcihldmVudCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VLZXlib2FyZFN0ZXBTaXplKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA+PSAnMScgJiYgZXZlbnQua2V5IDw9ICc5Jykge1xuICAgICAgICAgICAgdGhpcy5zdGVwU2l6ZSA9ICtldmVudC5rZXk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGtleWJvYXJkTW92ZUNyb3BwZXIoZXZlbnQpIHtcbiAgICAgICAgY29uc3Qga2V5Ym9hcmRXaGl0ZUxpc3Q6IHN0cmluZ1tdID0gWydBcnJvd1VwJywgJ0Fycm93RG93bicsICdBcnJvd1JpZ2h0JywgJ0Fycm93TGVmdCddO1xuICAgICAgICBpZiAoIShrZXlib2FyZFdoaXRlTGlzdC5pbmNsdWRlcyhldmVudC5rZXkpKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1vdmVUeXBlID0gZXZlbnQuc2hpZnRLZXkgPyBNb3ZlVHlwZXMuUmVzaXplIDogTW92ZVR5cGVzLk1vdmU7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZXZlbnQuYWx0S2V5ID8gdGhpcy5nZXRJbnZlcnRlZFBvc2l0aW9uRm9yS2V5KGV2ZW50LmtleSkgOiB0aGlzLmdldFBvc2l0aW9uRm9yS2V5KGV2ZW50LmtleSk7XG4gICAgICAgIGNvbnN0IG1vdmVFdmVudCA9IHRoaXMuZ2V0RXZlbnRGb3JLZXkoZXZlbnQua2V5LCB0aGlzLnN0ZXBTaXplKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuc3RhcnRNb3ZlKHtjbGllbnRYOiAwLCBjbGllbnRZOiAwfSwgbW92ZVR5cGUsIHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5tb3ZlSW1nKG1vdmVFdmVudCk7XG4gICAgICAgIHRoaXMubW92ZVN0b3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFBvc2l0aW9uRm9yS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAndG9wJztcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAncmlnaHQnO1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JvdHRvbSc7XG4gICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2xlZnQnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbnZlcnRlZFBvc2l0aW9uRm9yS2V5KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYm90dG9tJztcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgIHJldHVybiAndG9wJztcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAncmlnaHQnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRFdmVudEZvcktleShrZXk6IHN0cmluZywgc3RlcFNpemU6IG51bWJlcik6IGFueSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge2NsaWVudFg6IDAsIGNsaWVudFk6IHN0ZXBTaXplICogLTF9O1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtjbGllbnRYOiBzdGVwU2l6ZSwgY2xpZW50WTogMH07XG4gICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgIHJldHVybiB7Y2xpZW50WDogMCwgY2xpZW50WTogc3RlcFNpemV9O1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtjbGllbnRYOiBzdGVwU2l6ZSAqIC0xLCBjbGllbnRZOiAwfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0TW92ZShldmVudDogYW55LCBtb3ZlVHlwZTogTW92ZVR5cGVzLCBwb3NpdGlvbjogc3RyaW5nIHwgbnVsbCA9IG51bGwpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0ICYmIHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSAmJiB0aGlzLm1vdmVTdGFydC50eXBlID09PSBNb3ZlVHlwZXMuUGluY2gpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb3ZlU3RhcnQgPSB7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB0eXBlOiBtb3ZlVHlwZSxcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgY2xpZW50WDogdGhpcy5nZXRDbGllbnRYKGV2ZW50KSxcbiAgICAgICAgICAgIGNsaWVudFk6IHRoaXMuZ2V0Q2xpZW50WShldmVudCksXG4gICAgICAgICAgICAuLi50aGlzLmNyb3BwZXJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGFydFBpbmNoKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNhZmVJbWdEYXRhVXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubW92ZVN0YXJ0ID0ge1xuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgdHlwZTogTW92ZVR5cGVzLlBpbmNoLFxuICAgICAgICAgICAgcG9zaXRpb246ICdjZW50ZXInLFxuICAgICAgICAgICAgY2xpZW50WDogdGhpcy5jcm9wcGVyLngxICsgKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyAyLFxuICAgICAgICAgICAgY2xpZW50WTogdGhpcy5jcm9wcGVyLnkxICsgKHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlci55MSkgLyAyLFxuICAgICAgICAgICAgLi4udGhpcy5jcm9wcGVyXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6bW91c2Vtb3ZlJywgWyckZXZlbnQnXSlcbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDp0b3VjaG1vdmUnLCBbJyRldmVudCddKVxuICAgIG1vdmVJbWcoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQuYWN0aXZlKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09IE1vdmVUeXBlcy5Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdmVTdGFydC50eXBlID09PSBNb3ZlVHlwZXMuUmVzaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tDcm9wcGVyUG9zaXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblBpbmNoKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnN0b3BQcm9wYWdhdGlvbikge1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVTdGFydC50eXBlID09PSBNb3ZlVHlwZXMuUGluY2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TWF4U2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc291cmNlSW1hZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMubWF4U2l6ZS53aWR0aCA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIHRoaXMubWF4U2l6ZS5oZWlnaHQgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5tYXJnaW5MZWZ0ID0gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFN0eWxlKCdjYWxjKDUwJSAtICcgKyB0aGlzLm1heFNpemUud2lkdGggLyAyICsgJ3B4KScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNmb3JtZWRJbWFnZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluV2lkdGgoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q3JvcHBlclNjYWxlZE1pbkhlaWdodCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggPSAyMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IDIwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDcm9wcGVyU2NhbGVkTWluV2lkdGgoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoID0gdGhpcy5jcm9wcGVyTWluV2lkdGggPiAwXG4gICAgICAgICAgICA/IE1hdGgubWF4KDIwLCB0aGlzLmNyb3BwZXJNaW5XaWR0aCAvIHRoaXMudHJhbnNmb3JtZWRJbWFnZS53aWR0aCAqIHRoaXMubWF4U2l6ZS53aWR0aClcbiAgICAgICAgICAgIDogMjA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDcm9wcGVyU2NhbGVkTWluSGVpZ2h0KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQgPSBNYXRoLm1heCgyMCwgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNyb3BwZXJNaW5IZWlnaHQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQgPSBNYXRoLm1heCgyMCwgdGhpcy5jcm9wcGVyTWluSGVpZ2h0IC8gdGhpcy50cmFuc2Zvcm1lZEltYWdlLmhlaWdodCAqIHRoaXMubWF4U2l6ZS5oZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0ID0gMjA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrQ3JvcHBlclBvc2l0aW9uKG1haW50YWluU2l6ZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueDEgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gbWFpbnRhaW5TaXplID8gdGhpcy5jcm9wcGVyLngxIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci55MSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSBtYWludGFpblNpemUgPyB0aGlzLmNyb3BwZXIueTEgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLngyID4gdGhpcy5tYXhTaXplLndpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgLT0gbWFpbnRhaW5TaXplID8gKHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCkgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5tYXhTaXplLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueTIgPiB0aGlzLm1heFNpemUuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgLT0gbWFpbnRhaW5TaXplID8gKHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQpIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMubWF4U2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZXVwJylcbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDp0b3VjaGVuZCcpXG4gICAgbW92ZVN0b3AoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm1vdmVTdGFydC5hY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwaW5jaFN0b3AoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm1vdmVTdGFydC5hY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG1vdmUoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCBkaWZmWCA9IHRoaXMuZ2V0Q2xpZW50WChldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRYO1xuICAgICAgICBjb25zdCBkaWZmWSA9IHRoaXMuZ2V0Q2xpZW50WShldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRZO1xuXG4gICAgICAgIHRoaXMuY3JvcHBlci54MSA9IHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlg7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlk7XG4gICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlg7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemUoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBkaWZmWCA9IHRoaXMuZ2V0Q2xpZW50WChldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRYO1xuICAgICAgICBjb25zdCBkaWZmWSA9IHRoaXMuZ2V0Q2xpZW50WShldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRZO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubW92ZVN0YXJ0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3BsZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcHJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b21yaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlksIHRoaXMuY3JvcHBlci55MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlksIHRoaXMuY3JvcHBlci55MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b21sZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBldmVudC5zY2FsZTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IChNYXRoLmFicyh0aGlzLm1vdmVTdGFydC54MiAtIHRoaXMubW92ZVN0YXJ0LngxKSkgKiBzY2FsZTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSAoTWF0aC5hYnModGhpcy5tb3ZlU3RhcnQueTIgLSB0aGlzLm1vdmVTdGFydC55MSkpICogc2NhbGU7XG4gICAgICAgICAgICAgICAgY29uc3QgeDEgPSB0aGlzLmNyb3BwZXIueDE7XG4gICAgICAgICAgICAgICAgY29uc3QgeTEgPSB0aGlzLmNyb3BwZXIueTE7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQuY2xpZW50WCAtIChuZXdXaWR0aCAvIDIpLCB0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQuY2xpZW50WSAtIChuZXdIZWlnaHQgLyAyKSwgdGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC5jbGllbnRYICsgKG5ld1dpZHRoIC8gMiksIHgxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LmNsaWVudFkgKyAobmV3SGVpZ2h0IC8gMiksIHkxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1haW50YWluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tBc3BlY3RSYXRpbygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0FzcGVjdFJhdGlvKCk6IHZvaWQge1xuICAgICAgICBsZXQgb3ZlcmZsb3dYID0gMDtcbiAgICAgICAgbGV0IG92ZXJmbG93WSA9IDA7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLm1vdmVTdGFydC5wb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyLnkxKSAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLnkxLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngxICsgKHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlci55MSkgKiB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogKG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcGxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMuY3JvcHBlci55MiAtICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLngxLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLnkxLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcHJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLmNyb3BwZXIueTIgLSAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLnkxLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbXJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTEgKyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgY2FzZSAnYm90dG9tbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueDEsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyLnkxKSAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJmbG93WDEgPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLngxLCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVyZmxvd1gyID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVyZmxvd1kxID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3ZlcmZsb3dZMiA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueTEsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1gxID4gMCB8fCBvdmVyZmxvd1gyID4gMCB8fCBvdmVyZmxvd1kxID4gMCB8fCBvdmVyZmxvd1kyID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgKz0gKG92ZXJmbG93WTEgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WDEgPyAob3ZlcmZsb3dZMSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kyICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1gyID8gKG92ZXJmbG93WTIgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSArPSAob3ZlcmZsb3dZMiAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYMiA/IG92ZXJmbG93WTIgOiBvdmVyZmxvd1gyIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kxICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1gxID8gb3ZlcmZsb3dZMSA6IG92ZXJmbG93WDEgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZG9BdXRvQ3JvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0Nyb3ApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JvcCgpOiBJbWFnZUNyb3BwZWRFdmVudCB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5zb3VyY2VJbWFnZSAmJiB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy50cmFuc2Zvcm1lZEltYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRDcm9wSW1hZ2UuZW1pdCgpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VQb3NpdGlvbiA9IHRoaXMuZ2V0SW1hZ2VQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWFnZVBvc2l0aW9uLngyIC0gaW1hZ2VQb3NpdGlvbi54MTtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGltYWdlUG9zaXRpb24ueTIgLSBpbWFnZVBvc2l0aW9uLnkxO1xuXG4gICAgICAgICAgICBjb25zdCBjcm9wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgICAgY29uc3QgY3R4ID0gY3JvcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJhY2tncm91bmRDb2xvciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxlWCA9ICh0aGlzLnRyYW5zZm9ybS5zY2FsZSB8fCAxKSAqICh0aGlzLnRyYW5zZm9ybS5mbGlwSCA/IC0xIDogMSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2NhbGVZID0gKHRoaXMudHJhbnNmb3JtLnNjYWxlIHx8IDEpICogKHRoaXMudHJhbnNmb3JtLmZsaXBWID8gLTEgOiAxKTtcblxuICAgICAgICAgICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oc2NhbGVYLCAwLCAwLCBzY2FsZVksIHRoaXMudHJhbnNmb3JtZWRTaXplLndpZHRoIC8gMiwgdGhpcy50cmFuc2Zvcm1lZFNpemUuaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgtaW1hZ2VQb3NpdGlvbi54MSAvIHNjYWxlWCwgLWltYWdlUG9zaXRpb24ueTEgLyBzY2FsZVkpO1xuICAgICAgICAgICAgICAgIGN0eC5yb3RhdGUoKHRoaXMudHJhbnNmb3JtLnJvdGF0ZSB8fCAwKSAqIE1hdGguUEkgLyAxODApO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy50cmFuc2Zvcm1lZEltYWdlLCAtdGhpcy50cmFuc2Zvcm1lZFNpemUud2lkdGggLyAyLCAtdGhpcy50cmFuc2Zvcm1lZFNpemUuaGVpZ2h0IC8gMik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBvdXRwdXQ6IEltYWdlQ3JvcHBlZEV2ZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCwgaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjcm9wcGVyUG9zaXRpb246IHsuLi50aGlzLmNyb3BwZXJ9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250YWluV2l0aGluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0Lm9mZnNldEltYWdlUG9zaXRpb24gPSB0aGlzLmdldE9mZnNldEltYWdlUG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzaXplUmF0aW8gPSB0aGlzLmdldFJlc2l6ZVJhdGlvKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNpemVSYXRpbyAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQud2lkdGggPSBNYXRoLnJvdW5kKHdpZHRoICogcmVzaXplUmF0aW8pO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuaGVpZ2h0ID0gdGhpcy5tYWludGFpbkFzcGVjdFJhdGlvXG4gICAgICAgICAgICAgICAgICAgICAgICA/IE1hdGgucm91bmQob3V0cHV0LndpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogTWF0aC5yb3VuZChoZWlnaHQgKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZUNhbnZhcyhjcm9wQ2FudmFzLCBvdXRwdXQud2lkdGgsIG91dHB1dC5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvdXRwdXQuYmFzZTY0ID0gdGhpcy5jcm9wVG9CYXNlNjQoY3JvcENhbnZhcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWQuZW1pdChvdXRwdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbWFnZVBvc2l0aW9uKCk6IENyb3BwZXJQb3NpdGlvbiB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgcmF0aW8gPSB0aGlzLnRyYW5zZm9ybWVkU2l6ZS53aWR0aCAvIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcblxuICAgICAgICBjb25zdCBvdXQ6IENyb3BwZXJQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHgxOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MSAqIHJhdGlvKSxcbiAgICAgICAgICAgIHkxOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci55MSAqIHJhdGlvKSxcbiAgICAgICAgICAgIHgyOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MiAqIHJhdGlvKSxcbiAgICAgICAgICAgIHkyOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci55MiAqIHJhdGlvKVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghdGhpcy5jb250YWluV2l0aGluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIG91dC54MSA9IE1hdGgubWF4KG91dC54MSwgMCk7XG4gICAgICAgICAgICBvdXQueTEgPSBNYXRoLm1heChvdXQueTEsIDApO1xuICAgICAgICAgICAgb3V0LngyID0gTWF0aC5taW4ob3V0LngyLCB0aGlzLnRyYW5zZm9ybWVkU2l6ZS53aWR0aCk7XG4gICAgICAgICAgICBvdXQueTIgPSBNYXRoLm1pbihvdXQueTIsIHRoaXMudHJhbnNmb3JtZWRTaXplLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0T2Zmc2V0SW1hZ2VQb3NpdGlvbigpOiBDcm9wcGVyUG9zaXRpb24ge1xuICAgICAgICBjb25zdCBjYW52YXNSb3RhdGlvbiA9IHRoaXMuY2FudmFzUm90YXRpb24gKyB0aGlzLmV4aWZUcmFuc2Zvcm0ucm90YXRlO1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHJhdGlvID0gdGhpcy50cmFuc2Zvcm1lZFNpemUud2lkdGggLyBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgIGxldCBvZmZzZXRYOiBudW1iZXI7XG4gICAgICAgIGxldCBvZmZzZXRZOiBudW1iZXI7XG5cbiAgICAgICAgaWYgKGNhbnZhc1JvdGF0aW9uICUgMikge1xuICAgICAgICAgICAgb2Zmc2V0WCA9ICh0aGlzLnRyYW5zZm9ybWVkU2l6ZS53aWR0aCAtIHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCkgLyAyO1xuICAgICAgICAgICAgb2Zmc2V0WSA9ICh0aGlzLnRyYW5zZm9ybWVkU2l6ZS5oZWlnaHQgLSB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCkgLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Zmc2V0WCA9ICh0aGlzLnRyYW5zZm9ybWVkU2l6ZS53aWR0aCAtIHRoaXMub3JpZ2luYWxTaXplLndpZHRoKSAvIDI7XG4gICAgICAgICAgICBvZmZzZXRZID0gKHRoaXMudHJhbnNmb3JtZWRTaXplLmhlaWdodCAtIHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCkgLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3V0OiBDcm9wcGVyUG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4MTogTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueDEgKiByYXRpbykgLSBvZmZzZXRYLFxuICAgICAgICAgICAgeTE6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLnkxICogcmF0aW8pIC0gb2Zmc2V0WSxcbiAgICAgICAgICAgIHgyOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MiAqIHJhdGlvKSAtIG9mZnNldFgsXG4gICAgICAgICAgICB5MjogTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueTIgKiByYXRpbykgLSBvZmZzZXRZXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5XaXRoaW5Bc3BlY3RSYXRpbykge1xuICAgICAgICAgICAgb3V0LngxID0gTWF0aC5tYXgob3V0LngxLCAwKTtcbiAgICAgICAgICAgIG91dC55MSA9IE1hdGgubWF4KG91dC55MSwgMCk7XG4gICAgICAgICAgICBvdXQueDIgPSBNYXRoLm1pbihvdXQueDIsIHRoaXMudHJhbnNmb3JtZWRTaXplLndpZHRoKTtcbiAgICAgICAgICAgIG91dC55MiA9IE1hdGgubWluKG91dC55MiwgdGhpcy50cmFuc2Zvcm1lZFNpemUuaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcm9wVG9CYXNlNjQoY3JvcENhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gY3JvcENhbnZhcy50b0RhdGFVUkwoJ2ltYWdlLycgKyB0aGlzLmZvcm1hdCwgdGhpcy5nZXRRdWFsaXR5KCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UXVhbGl0eSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdGhpcy5pbWFnZVF1YWxpdHkgLyAxMDApKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlc2l6ZVJhdGlvKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMucmVzaXplVG9XaWR0aCA+IDApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vbmx5U2NhbGVEb3duIHx8IHdpZHRoID4gdGhpcy5yZXNpemVUb1dpZHRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzaXplVG9XaWR0aCAvIHdpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVzaXplVG9IZWlnaHQgPiAwKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub25seVNjYWxlRG93biB8fCBoZWlnaHQgPiB0aGlzLnJlc2l6ZVRvSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzaXplVG9IZWlnaHQgLyBoZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGllbnRYKGV2ZW50OiBhbnkpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXSA/IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCA6IGV2ZW50LmNsaWVudFgpIHx8IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGllbnRZKGV2ZW50OiBhbnkpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXSA/IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSA6IGV2ZW50LmNsaWVudFkpIHx8IDA7XG4gICAgfVxufVxuIl19