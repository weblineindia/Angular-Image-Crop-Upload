/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, isDevMode, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { getTransformationsFromExifData, supportsAutomaticRotation } from '../utils/exif.utils';
import { resizeCanvas } from '../utils/resize.utils';
import { MoveTypes } from '../interfaces/move-start.interface';
export class ImageCropperComponent {
    /**
     * @param {?} sanitizer
     * @param {?} cd
     */
    constructor(sanitizer, cd) {
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
    ngOnChanges(changes) {
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
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    onChangesInputImage(changes) {
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
    }
    /**
     * @private
     * @return {?}
     */
    isValidImageChangedEvent() {
        return this.imageChangedEvent
            && this.imageChangedEvent.target
            && this.imageChangedEvent.target.files
            && this.imageChangedEvent.target.files.length > 0;
    }
    /**
     * @private
     * @return {?}
     */
    setCssTransform() {
        this.safeTransformStyle = this.sanitizer.bypassSecurityTrustStyle('scaleX(' + (this.transform.scale || 1) * (this.transform.flipH ? -1 : 1) + ')' +
            'scaleY(' + (this.transform.scale || 1) * (this.transform.flipV ? -1 : 1) + ')' +
            'rotate(' + (this.transform.rotate || 0) + 'deg)');
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.stepSize = this.initialStepSize;
        this.activatePinchGesture();
    }
    /**
     * @private
     * @return {?}
     */
    initCropper() {
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
    }
    /**
     * @private
     * @param {?} imageBase64
     * @param {?} imageType
     * @return {?}
     */
    loadImage(imageBase64, imageType) {
        if (this.isValidImageType(imageType)) {
            this.loadBase64Image(imageBase64);
        }
        else {
            this.loadImageFailed.emit();
        }
    }
    /**
     * @private
     * @param {?} file
     * @return {?}
     */
    loadImageFile(file) {
        /** @type {?} */
        const fileReader = new FileReader();
        fileReader.onload = (/**
         * @param {?} event
         * @return {?}
         */
        (event) => this.loadImage(event.target.result, file.type));
        fileReader.readAsDataURL(file);
    }
    /**
     * @private
     * @param {?} type
     * @return {?}
     */
    isValidImageType(type) {
        return /image\/(png|jpg|jpeg|bmp|gif|tiff|webp)/.test(type);
    }
    /**
     * @private
     * @param {?} imageBase64
     * @return {?}
     */
    loadBase64Image(imageBase64) {
        this.autoRotateSupported
            .then((/**
         * @param {?} supported
         * @return {?}
         */
        (supported) => this.checkExifAndLoadBase64Image(imageBase64, supported)))
            .then((/**
         * @return {?}
         */
        () => this.transformOriginalImage()))
            .catch((/**
         * @param {?} error
         * @return {?}
         */
        (error) => {
            this.loadImageFailed.emit();
            this.originalImage = null;
            this.originalBase64 = null;
            console.error(error);
        }));
    }
    /**
     * @private
     * @param {?} imageBase64
     * @param {?} autoRotateSupported
     * @return {?}
     */
    checkExifAndLoadBase64Image(imageBase64, autoRotateSupported) {
        return new Promise((/**
         * @param {?} resolve
         * @param {?} reject
         * @return {?}
         */
        (resolve, reject) => {
            this.originalImage = new Image();
            this.originalImage.onload = (/**
             * @return {?}
             */
            () => {
                this.originalBase64 = imageBase64;
                this.exifTransform = getTransformationsFromExifData(autoRotateSupported ? -1 : imageBase64);
                this.originalSize.width = this.originalImage.naturalWidth;
                this.originalSize.height = this.originalImage.naturalHeight;
                resolve();
            });
            this.originalImage.onerror = reject;
            this.originalImage.src = imageBase64;
        }));
    }
    /**
     * @private
     * @param {?} url
     * @return {?}
     */
    loadImageFromURL(url) {
        /** @type {?} */
        const img = new Image();
        img.onerror = (/**
         * @return {?}
         */
        () => this.loadImageFailed.emit());
        img.onload = (/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const canvas = document.createElement('canvas');
            /** @type {?} */
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            this.loadBase64Image(canvas.toDataURL());
        });
        img.crossOrigin = 'anonymous';
        img.src = url;
    }
    /**
     * @private
     * @return {?}
     */
    transformOriginalImage() {
        if (!this.originalImage || !this.originalImage.complete || !this.exifTransform) {
            return Promise.reject(new Error('No image loaded'));
        }
        /** @type {?} */
        const transformedBase64 = this.transformImageBase64();
        return this.setTransformedImage(transformedBase64);
    }
    /**
     * @private
     * @return {?}
     */
    transformImageBase64() {
        /** @type {?} */
        const canvasRotation = this.canvasRotation + this.exifTransform.rotate;
        if (canvasRotation === 0 && !this.exifTransform.flip && !this.containWithinAspectRatio) {
            return this.originalBase64;
        }
        /** @type {?} */
        const transformedSize = this.getTransformedSize();
        /** @type {?} */
        const canvas = document.createElement('canvas');
        canvas.width = transformedSize.width;
        canvas.height = transformedSize.height;
        /** @type {?} */
        const ctx = canvas.getContext('2d');
        ctx.setTransform(this.exifTransform.flip ? -1 : 1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI * (canvasRotation / 2));
        ctx.drawImage(this.originalImage, -this.originalSize.width / 2, -this.originalSize.height / 2);
        return canvas.toDataURL();
    }
    /**
     * @private
     * @return {?}
     */
    getTransformedSize() {
        /** @type {?} */
        const canvasRotation = this.canvasRotation + this.exifTransform.rotate;
        if (this.containWithinAspectRatio) {
            if (canvasRotation % 2) {
                /** @type {?} */
                const minWidthToContain = this.originalSize.width * this.aspectRatio;
                /** @type {?} */
                const minHeightToContain = this.originalSize.height / this.aspectRatio;
                return {
                    width: Math.max(this.originalSize.height, minWidthToContain),
                    height: Math.max(this.originalSize.width, minHeightToContain),
                };
            }
            else {
                /** @type {?} */
                const minWidthToContain = this.originalSize.height * this.aspectRatio;
                /** @type {?} */
                const minHeightToContain = this.originalSize.width / this.aspectRatio;
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
    }
    /**
     * @private
     * @param {?} transformedBase64
     * @return {?}
     */
    setTransformedImage(transformedBase64) {
        return new Promise((/**
         * @param {?} resolve
         * @return {?}
         */
        (resolve) => {
            this.transformedBase64 = transformedBase64;
            this.safeImgDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(transformedBase64);
            this.transformedImage = new Image();
            this.transformedImage.onload = (/**
             * @return {?}
             */
            () => {
                this.transformedSize.width = this.transformedImage.naturalWidth;
                this.transformedSize.height = this.transformedImage.naturalHeight;
                this.cd.markForCheck();
                resolve();
            });
            this.transformedImage.src = this.transformedBase64;
        }));
    }
    /**
     * @return {?}
     */
    imageLoadedInView() {
        if (this.transformedImage != null) {
            this.imageLoaded.emit();
            this.setImageMaxSizeRetries = 0;
            setTimeout((/**
             * @return {?}
             */
            () => this.checkImageMaxSizeRecursively()));
        }
    }
    /**
     * @private
     * @return {?}
     */
    checkImageMaxSizeRecursively() {
        if (this.setImageMaxSizeRetries > 40) {
            this.loadImageFailed.emit();
        }
        else if (this.sourceImageLoaded()) {
            this.setMaxSize();
            this.setCropperScaledMinSize();
            this.resetCropperPosition();
            this.cropperReady.emit(Object.assign({}, this.maxSize));
            this.cd.markForCheck();
        }
        else {
            this.setImageMaxSizeRetries++;
            setTimeout((/**
             * @return {?}
             */
            () => this.checkImageMaxSizeRecursively()), 50);
        }
    }
    /**
     * @private
     * @return {?}
     */
    sourceImageLoaded() {
        return this.sourceImage && this.sourceImage.nativeElement && this.sourceImage.nativeElement.offsetWidth > 0;
    }
    /**
     * @return {?}
     */
    onResize() {
        this.resizeCropperPosition();
        this.setMaxSize();
        this.setCropperScaledMinSize();
    }
    /**
     * @private
     * @return {?}
     */
    activatePinchGesture() {
        if (this.Hammer) {
            /** @type {?} */
            const hammer = new this.Hammer(this.wrapper.nativeElement);
            hammer.get('pinch').set({ enable: true });
            hammer.on('pinchmove', this.onPinch.bind(this));
            hammer.on('pinchend', this.pinchStop.bind(this));
            hammer.on('pinchstart', this.startPinch.bind(this));
        }
        else if (isDevMode()) {
            console.warn('[NgxImageCropper] Could not find HammerJS - Pinch Gesture won\'t work');
        }
    }
    /**
     * @private
     * @return {?}
     */
    resizeCropperPosition() {
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
        if (this.maxSize.width !== sourceImageElement.offsetWidth || this.maxSize.height !== sourceImageElement.offsetHeight) {
            this.cropper.x1 = this.cropper.x1 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.x2 = this.cropper.x2 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.y1 = this.cropper.y1 * sourceImageElement.offsetHeight / this.maxSize.height;
            this.cropper.y2 = this.cropper.y2 * sourceImageElement.offsetHeight / this.maxSize.height;
        }
    }
    /**
     * @return {?}
     */
    resetCropperPosition() {
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
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
            const cropperHeight = sourceImageElement.offsetWidth / this.aspectRatio;
            this.cropper.y1 = (sourceImageElement.offsetHeight - cropperHeight) / 2;
            this.cropper.y2 = this.cropper.y1 + cropperHeight;
        }
        else {
            this.cropper.y1 = 0;
            this.cropper.y2 = sourceImageElement.offsetHeight;
            /** @type {?} */
            const cropperWidth = sourceImageElement.offsetHeight * this.aspectRatio;
            this.cropper.x1 = (sourceImageElement.offsetWidth - cropperWidth) / 2;
            this.cropper.x2 = this.cropper.x1 + cropperWidth;
        }
        this.doAutoCrop();
        this.imageVisible = true;
    }
    /**
     * @param {?} event
     * @return {?}
     */
    keyboardAccess(event) {
        this.changeKeyboardStepSize(event);
        this.keyboardMoveCropper(event);
    }
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    changeKeyboardStepSize(event) {
        if (event.key >= '1' && event.key <= '9') {
            this.stepSize = +event.key;
            return;
        }
    }
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    keyboardMoveCropper(event) {
        /** @type {?} */
        const keyboardWhiteList = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
        if (!(keyboardWhiteList.includes(event.key))) {
            return;
        }
        /** @type {?} */
        const moveType = event.shiftKey ? MoveTypes.Resize : MoveTypes.Move;
        /** @type {?} */
        const position = event.altKey ? this.getInvertedPositionForKey(event.key) : this.getPositionForKey(event.key);
        /** @type {?} */
        const moveEvent = this.getEventForKey(event.key, this.stepSize);
        event.preventDefault();
        event.stopPropagation();
        this.startMove({ clientX: 0, clientY: 0 }, moveType, position);
        this.moveImg(moveEvent);
        this.moveStop();
    }
    /**
     * @private
     * @param {?} key
     * @return {?}
     */
    getPositionForKey(key) {
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
    }
    /**
     * @private
     * @param {?} key
     * @return {?}
     */
    getInvertedPositionForKey(key) {
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
    }
    /**
     * @private
     * @param {?} key
     * @param {?} stepSize
     * @return {?}
     */
    getEventForKey(key, stepSize) {
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
    }
    /**
     * @param {?} event
     * @param {?} moveType
     * @param {?=} position
     * @return {?}
     */
    startMove(event, moveType, position = null) {
        if (this.moveStart && this.moveStart.active && this.moveStart.type === MoveTypes.Pinch) {
            return;
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        this.moveStart = Object.assign({ active: true, type: moveType, position, clientX: this.getClientX(event), clientY: this.getClientY(event) }, this.cropper);
    }
    /**
     * @param {?} event
     * @return {?}
     */
    startPinch(event) {
        if (!this.safeImgDataUrl) {
            return;
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        this.moveStart = Object.assign({ active: true, type: MoveTypes.Pinch, position: 'center', clientX: this.cropper.x1 + (this.cropper.x2 - this.cropper.x1) / 2, clientY: this.cropper.y1 + (this.cropper.y2 - this.cropper.y1) / 2 }, this.cropper);
    }
    /**
     * @param {?} event
     * @return {?}
     */
    moveImg(event) {
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
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onPinch(event) {
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
    }
    /**
     * @private
     * @return {?}
     */
    setMaxSize() {
        if (this.sourceImage) {
            /** @type {?} */
            const sourceImageElement = this.sourceImage.nativeElement;
            this.maxSize.width = sourceImageElement.offsetWidth;
            this.maxSize.height = sourceImageElement.offsetHeight;
            this.marginLeft = this.sanitizer.bypassSecurityTrustStyle('calc(50% - ' + this.maxSize.width / 2 + 'px)');
        }
    }
    /**
     * @private
     * @return {?}
     */
    setCropperScaledMinSize() {
        if (this.transformedImage) {
            this.setCropperScaledMinWidth();
            this.setCropperScaledMinHeight();
        }
        else {
            this.cropperScaledMinWidth = 20;
            this.cropperScaledMinHeight = 20;
        }
    }
    /**
     * @private
     * @return {?}
     */
    setCropperScaledMinWidth() {
        this.cropperScaledMinWidth = this.cropperMinWidth > 0
            ? Math.max(20, this.cropperMinWidth / this.transformedImage.width * this.maxSize.width)
            : 20;
    }
    /**
     * @private
     * @return {?}
     */
    setCropperScaledMinHeight() {
        if (this.maintainAspectRatio) {
            this.cropperScaledMinHeight = Math.max(20, this.cropperScaledMinWidth / this.aspectRatio);
        }
        else if (this.cropperMinHeight > 0) {
            this.cropperScaledMinHeight = Math.max(20, this.cropperMinHeight / this.transformedImage.height * this.maxSize.height);
        }
        else {
            this.cropperScaledMinHeight = 20;
        }
    }
    /**
     * @private
     * @param {?=} maintainSize
     * @return {?}
     */
    checkCropperPosition(maintainSize = false) {
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
    }
    /**
     * @return {?}
     */
    moveStop() {
        if (this.moveStart.active) {
            this.moveStart.active = false;
            this.doAutoCrop();
        }
    }
    /**
     * @return {?}
     */
    pinchStop() {
        if (this.moveStart.active) {
            this.moveStart.active = false;
            this.doAutoCrop();
        }
    }
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    move(event) {
        /** @type {?} */
        const diffX = this.getClientX(event) - this.moveStart.clientX;
        /** @type {?} */
        const diffY = this.getClientY(event) - this.moveStart.clientY;
        this.cropper.x1 = this.moveStart.x1 + diffX;
        this.cropper.y1 = this.moveStart.y1 + diffY;
        this.cropper.x2 = this.moveStart.x2 + diffX;
        this.cropper.y2 = this.moveStart.y2 + diffY;
    }
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    resize(event) {
        /** @type {?} */
        const diffX = this.getClientX(event) - this.moveStart.clientX;
        /** @type {?} */
        const diffY = this.getClientY(event) - this.moveStart.clientY;
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
                const scale = event.scale;
                /** @type {?} */
                const newWidth = (Math.abs(this.moveStart.x2 - this.moveStart.x1)) * scale;
                /** @type {?} */
                const newHeight = (Math.abs(this.moveStart.y2 - this.moveStart.y1)) * scale;
                /** @type {?} */
                const x1 = this.cropper.x1;
                /** @type {?} */
                const y1 = this.cropper.y1;
                this.cropper.x1 = Math.min(this.moveStart.clientX - (newWidth / 2), this.cropper.x2 - this.cropperScaledMinWidth);
                this.cropper.y1 = Math.min(this.moveStart.clientY - (newHeight / 2), this.cropper.y2 - this.cropperScaledMinHeight);
                this.cropper.x2 = Math.max(this.moveStart.clientX + (newWidth / 2), x1 + this.cropperScaledMinWidth);
                this.cropper.y2 = Math.max(this.moveStart.clientY + (newHeight / 2), y1 + this.cropperScaledMinHeight);
                break;
        }
        if (this.maintainAspectRatio) {
            this.checkAspectRatio();
        }
    }
    /**
     * @private
     * @return {?}
     */
    checkAspectRatio() {
        /** @type {?} */
        let overflowX = 0;
        /** @type {?} */
        let overflowY = 0;
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
                const overflowX1 = Math.max(0 - this.cropper.x1, 0);
                /** @type {?} */
                const overflowX2 = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                /** @type {?} */
                const overflowY1 = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                /** @type {?} */
                const overflowY2 = Math.max(0 - this.cropper.y1, 0);
                if (overflowX1 > 0 || overflowX2 > 0 || overflowY1 > 0 || overflowY2 > 0) {
                    this.cropper.x1 += (overflowY1 * this.aspectRatio) > overflowX1 ? (overflowY1 * this.aspectRatio) : overflowX1;
                    this.cropper.x2 -= (overflowY2 * this.aspectRatio) > overflowX2 ? (overflowY2 * this.aspectRatio) : overflowX2;
                    this.cropper.y1 += (overflowY2 * this.aspectRatio) > overflowX2 ? overflowY2 : overflowX2 / this.aspectRatio;
                    this.cropper.y2 -= (overflowY1 * this.aspectRatio) > overflowX1 ? overflowY1 : overflowX1 / this.aspectRatio;
                }
                break;
        }
    }
    /**
     * @private
     * @return {?}
     */
    doAutoCrop() {
        if (this.autoCrop) {
            this.crop();
        }
    }
    /**
     * @return {?}
     */
    crop() {
        if (this.sourceImage && this.sourceImage.nativeElement && this.transformedImage != null) {
            this.startCropImage.emit();
            /** @type {?} */
            const imagePosition = this.getImagePosition();
            /** @type {?} */
            const width = imagePosition.x2 - imagePosition.x1;
            /** @type {?} */
            const height = imagePosition.y2 - imagePosition.y1;
            /** @type {?} */
            const cropCanvas = (/** @type {?} */ (document.createElement('canvas')));
            cropCanvas.width = width;
            cropCanvas.height = height;
            /** @type {?} */
            const ctx = cropCanvas.getContext('2d');
            if (ctx) {
                if (this.backgroundColor != null) {
                    ctx.fillStyle = this.backgroundColor;
                    ctx.fillRect(0, 0, width, height);
                }
                /** @type {?} */
                const scaleX = (this.transform.scale || 1) * (this.transform.flipH ? -1 : 1);
                /** @type {?} */
                const scaleY = (this.transform.scale || 1) * (this.transform.flipV ? -1 : 1);
                ctx.setTransform(scaleX, 0, 0, scaleY, this.transformedSize.width / 2, this.transformedSize.height / 2);
                ctx.translate(-imagePosition.x1 / scaleX, -imagePosition.y1 / scaleY);
                ctx.rotate((this.transform.rotate || 0) * Math.PI / 180);
                ctx.drawImage(this.transformedImage, -this.transformedSize.width / 2, -this.transformedSize.height / 2);
                /** @type {?} */
                const output = {
                    width, height,
                    imagePosition,
                    cropperPosition: Object.assign({}, this.cropper)
                };
                if (this.containWithinAspectRatio) {
                    output.offsetImagePosition = this.getOffsetImagePosition();
                }
                /** @type {?} */
                const resizeRatio = this.getResizeRatio(width, height);
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
    }
    /**
     * @private
     * @return {?}
     */
    getImagePosition() {
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
        /** @type {?} */
        const ratio = this.transformedSize.width / sourceImageElement.offsetWidth;
        /** @type {?} */
        const out = {
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
    }
    /**
     * @private
     * @return {?}
     */
    getOffsetImagePosition() {
        /** @type {?} */
        const canvasRotation = this.canvasRotation + this.exifTransform.rotate;
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
        /** @type {?} */
        const ratio = this.transformedSize.width / sourceImageElement.offsetWidth;
        /** @type {?} */
        let offsetX;
        /** @type {?} */
        let offsetY;
        if (canvasRotation % 2) {
            offsetX = (this.transformedSize.width - this.originalSize.height) / 2;
            offsetY = (this.transformedSize.height - this.originalSize.width) / 2;
        }
        else {
            offsetX = (this.transformedSize.width - this.originalSize.width) / 2;
            offsetY = (this.transformedSize.height - this.originalSize.height) / 2;
        }
        /** @type {?} */
        const out = {
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
    }
    /**
     * @private
     * @param {?} cropCanvas
     * @return {?}
     */
    cropToBase64(cropCanvas) {
        return cropCanvas.toDataURL('image/' + this.format, this.getQuality());
    }
    /**
     * @private
     * @return {?}
     */
    getQuality() {
        return Math.min(1, Math.max(0, this.imageQuality / 100));
    }
    /**
     * @private
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    getResizeRatio(width, height) {
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
    }
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    getClientX(event) {
        return (event.touches && event.touches[0] ? event.touches[0].clientX : event.clientX) || 0;
    }
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    getClientY(event) {
        return (event.touches && event.touches[0] ? event.touches[0].clientY : event.clientY) || 0;
    }
}
ImageCropperComponent.decorators = [
    { type: Component, args: [{
                selector: 'image-cropper',
                template: "<div [style.background]=\"imageVisible && backgroundColor\"\n     #wrapper\n>\n    <img\n      #sourceImage\n      class=\"source-image\"\n      *ngIf=\"safeImgDataUrl\"\n      [src]=\"safeImgDataUrl\"\n      [style.visibility]=\"imageVisible ? 'visible' : 'hidden'\"\n      [style.transform]=\"safeTransformStyle\"\n      (load)=\"imageLoadedInView()\"\n    />\n    <div\n        class=\"overlay\"\n        [style.width.px]=\"maxSize.width\"\n        [style.height.px]=\"maxSize.height\"\n        [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\"\n    ></div>\n    <div class=\"cropper\"\n         *ngIf=\"imageVisible\"\n         [class.rounded]=\"roundCropper\"\n         [style.top.px]=\"cropper.y1\"\n         [style.left.px]=\"cropper.x1\"\n         [style.width.px]=\"cropper.x2 - cropper.x1\"\n         [style.height.px]=\"cropper.y2 - cropper.y1\"\n         [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\"\n         [style.visibility]=\"imageVisible ? 'visible' : 'hidden'\"\n         (keydown)=\"keyboardAccess($event)\"\n         tabindex=\"0\"\n    >\n        <div\n            (mousedown)=\"startMove($event, moveTypes.Move)\"\n            (touchstart)=\"startMove($event, moveTypes.Move)\"\n            class=\"move\">\n        </div>\n        <ng-container *ngIf=\"!hideResizeSquares\">\n            <span class=\"resize topleft\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'topleft')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'topleft')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize top\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize topright\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'topright')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'topright')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize right\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize bottomright\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'bottomright')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'bottomright')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize bottom\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize bottomleft\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'bottomleft')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'bottomleft')\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize left\">\n                <span class=\"square\"></span>\n            </span>\n            <span class=\"resize-bar top\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'top')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'top')\">\n            </span>\n            <span class=\"resize-bar right\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'right')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'right')\">\n            </span>\n            <span class=\"resize-bar bottom\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'bottom')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'bottom')\">\n            </span>\n            <span class=\"resize-bar left\"\n                  (mousedown)=\"startMove($event, moveTypes.Resize, 'left')\"\n                  (touchstart)=\"startMove($event, moveTypes.Resize, 'left')\">\n            </span>\n        </ng-container>\n    </div>\n</div>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [":host{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center}:host>div{width:100%;position:relative}:host>div img.source-image{max-width:100%;max-height:100%;transform-origin:center}:host .overlay{position:absolute;pointer-events:none;touch-action:none;outline:var(--cropper-overlay-color,#fff) solid 100vw;top:0;left:0}:host .cropper{position:absolute;display:flex;color:#53535c;background:0 0;outline:rgba(255,255,255,.3) solid 100vw;outline:var(--cropper-outline-color,rgba(255,255,255,.3)) solid 100vw;touch-action:none}:host .cropper:after{position:absolute;content:\"\";top:0;bottom:0;left:0;right:0;pointer-events:none;border:1px dashed;opacity:.75;color:inherit;z-index:1}:host .cropper .move{width:100%;cursor:move;border:1px solid rgba(255,255,255,.5)}:host .cropper:focus .move{border-color:#1e90ff;border-width:2px}:host .cropper .resize{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}:host .cropper .resize .square{display:inline-block;background:#53535c;width:6px;height:6px;border:1px solid rgba(255,255,255,.5);box-sizing:content-box}:host .cropper .resize.topleft{top:-12px;left:-12px;cursor:nwse-resize}:host .cropper .resize.top{top:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.topright{top:-12px;right:-12px;cursor:nesw-resize}:host .cropper .resize.right{top:calc(50% - 12px);right:-12px;cursor:ew-resize}:host .cropper .resize.bottomright{bottom:-12px;right:-12px;cursor:nwse-resize}:host .cropper .resize.bottom{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.bottomleft{bottom:-12px;left:-12px;cursor:nesw-resize}:host .cropper .resize.left{top:calc(50% - 12px);left:-12px;cursor:ew-resize}:host .cropper .resize-bar{position:absolute;z-index:1}:host .cropper .resize-bar.top{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.right{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper .resize-bar.bottom{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.left{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper.rounded{outline-color:transparent}:host .cropper.rounded:after{border-radius:100%;box-shadow:0 0 0 100vw rgba(255,255,255,.3);box-shadow:0 0 0 100vw var(--cropper-outline-color,rgba(255,255,255,.3))}@media (orientation:portrait){:host .cropper{outline-width:100vh}:host .cropper.rounded:after{box-shadow:0 0 0 100vh rgba(255,255,255,.3);box-shadow:0 0 0 100vh var(--cropper-outline-color,rgba(255,255,255,.3))}}:host .cropper.rounded .move{border-radius:100%}:host.disabled .cropper .move,:host.disabled .cropper .resize,:host.disabled .cropper .resize-bar{display:none}"]
            }] }
];
/** @nocollapse */
ImageCropperComponent.ctorParameters = () => [
    { type: DomSanitizer },
    { type: ChangeDetectorRef }
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci8iLCJzb3VyY2VzIjpbImxpYi9jb21wb25lbnQvaW1hZ2UtY3JvcHBlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFDSCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFdBQVcsRUFDWCxZQUFZLEVBQ1osS0FBSyxFQUNMLFNBQVMsRUFHVCxNQUFNLEVBRU4sU0FBUyxFQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxZQUFZLEVBQXNCLE1BQU0sMkJBQTJCLENBQUM7QUFFN0UsT0FBTyxFQUFFLDhCQUE4QixFQUFFLHlCQUF5QixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaEcsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBR3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQVEvRCxNQUFNLE9BQU8scUJBQXFCOzs7OztJQW1FOUIsWUFBb0IsU0FBdUIsRUFDdkIsRUFBcUI7UUFEckIsY0FBUyxHQUFULFNBQVMsQ0FBYztRQUN2QixPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQW5FakMsV0FBTSxHQUFpQixPQUFPLE1BQU0sS0FBSyxXQUFXO1lBQ3hELENBQUMsQ0FBQyxtQkFBQSxDQUFDLG1CQUFBLE1BQU0sRUFBTyxDQUFDLENBQUMsTUFBTSxFQUFnQjtZQUN4QyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBUUgsMkJBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLDBCQUFxQixHQUFHLEVBQUUsQ0FBQztRQUMzQiwyQkFBc0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsa0JBQWEsR0FBa0IsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztRQUN4RCx3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Qy9DLGlEQUEyQzs7Ozs7SUFDM0MsK0NBQStCOzs7OztJQUMvQixrREFBa0M7Ozs7O0lBQ2xDLDBDQUE2Qjs7Ozs7SUFDN0IsNkNBQWlDOzs7OztJQUNqQyxnREFBb0M7Ozs7O0lBQ3BDLHVEQUFtQzs7Ozs7SUFDbkMsc0RBQW1DOzs7OztJQUNuQyx1REFBb0M7Ozs7O0lBQ3BDLDhDQUFnRTs7Ozs7SUFDaEUsb0RBQTRFOzs7OztJQUM1RSx5Q0FBcUI7O0lBRXJCLCtDQUFpQzs7SUFDakMsbURBQXVDOztJQUN2QywyQ0FBdUM7O0lBQ3ZDLHdDQUFvQjs7SUFDcEIsNkNBQXFCOztJQUNyQiwwQ0FBc0I7O0lBRXRCLHdDQUEwRDs7SUFDMUQsNENBQW1FOztJQUVuRSxrREFBZ0M7O0lBQ2hDLHlDQUEwQjs7SUFDMUIsNENBQTZCOztJQUM3QiwwQ0FBeUI7O0lBRXpCLHVDQUFpRTs7SUFDakUsb0RBQW9DOztJQUNwQywwQ0FBd0M7O0lBQ3hDLDRDQUF5Qjs7SUFDekIsOENBQTJCOztJQUMzQiwrQ0FBNEI7O0lBQzVCLGdEQUE2Qjs7SUFDN0IsaURBQThCOztJQUM5QiwrQ0FBNEI7O0lBQzVCLGdEQUE2Qjs7SUFDN0IsNkNBQThCOztJQUM5Qiw4Q0FBK0I7O0lBQy9CLDZDQUEyQjs7SUFDM0IseUNBQXlCOztJQUN6QixnREFBaUM7O0lBQ2pDLHlEQUEwQzs7SUFDMUMsa0RBQW1DOztJQUNuQyx3Q0FLRTs7SUFDRiwyQ0FDa0Q7O0lBQ2xELHlDQUMwQjs7SUFFMUIsNkNBQStEOztJQUMvRCwrQ0FBb0Q7O0lBQ3BELDRDQUFpRDs7SUFDakQsNkNBQXdEOztJQUN4RCxnREFBcUQ7Ozs7O0lBRXpDLDBDQUErQjs7Ozs7SUFDL0IsbUNBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBDb21wb25lbnQsXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSG9zdEJpbmRpbmcsXG4gICAgSG9zdExpc3RlbmVyLFxuICAgIElucHV0LFxuICAgIGlzRGV2TW9kZSxcbiAgICBPbkNoYW5nZXMsXG4gICAgT25Jbml0LFxuICAgIE91dHB1dCxcbiAgICBTaW1wbGVDaGFuZ2VzLFxuICAgIFZpZXdDaGlsZFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERvbVNhbml0aXplciwgU2FmZVN0eWxlLCBTYWZlVXJsIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5pbXBvcnQgeyBDcm9wcGVyUG9zaXRpb24sIERpbWVuc2lvbnMsIEltYWdlQ3JvcHBlZEV2ZW50LCBJbWFnZVRyYW5zZm9ybSwgTW92ZVN0YXJ0IH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBnZXRUcmFuc2Zvcm1hdGlvbnNGcm9tRXhpZkRhdGEsIHN1cHBvcnRzQXV0b21hdGljUm90YXRpb24gfSBmcm9tICcuLi91dGlscy9leGlmLnV0aWxzJztcbmltcG9ydCB7IHJlc2l6ZUNhbnZhcyB9IGZyb20gJy4uL3V0aWxzL3Jlc2l6ZS51dGlscyc7XG5pbXBvcnQgeyBFeGlmVHJhbnNmb3JtIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9leGlmLXRyYW5zZm9ybS5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgSGFtbWVyU3RhdGljIH0gZnJvbSAnLi4vdXRpbHMvaGFtbWVyLnV0aWxzJztcbmltcG9ydCB7IE1vdmVUeXBlcyB9IGZyb20gJy4uL2ludGVyZmFjZXMvbW92ZS1zdGFydC5pbnRlcmZhY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2ltYWdlLWNyb3BwZXInLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbWFnZS1jcm9wcGVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9pbWFnZS1jcm9wcGVyLmNvbXBvbmVudC5zY3NzJ10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VDcm9wcGVyQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQge1xuICAgIHByaXZhdGUgSGFtbWVyOiBIYW1tZXJTdGF0aWMgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICA/ICh3aW5kb3cgYXMgYW55KS5IYW1tZXIgYXMgSGFtbWVyU3RhdGljXG4gICAgICAgIDogbnVsbDtcbiAgICBwcml2YXRlIG9yaWdpbmFsSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsO1xuICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBwcml2YXRlIG9yaWdpbmFsQmFzZTY0OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEJhc2U2NDogc3RyaW5nO1xuICAgIHByaXZhdGUgbW92ZVN0YXJ0OiBNb3ZlU3RhcnQ7XG4gICAgcHJpdmF0ZSBvcmlnaW5hbFNpemU6IERpbWVuc2lvbnM7XG4gICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZFNpemU6IERpbWVuc2lvbnM7XG4gICAgcHJpdmF0ZSBzZXRJbWFnZU1heFNpemVSZXRyaWVzID0gMDtcbiAgICBwcml2YXRlIGNyb3BwZXJTY2FsZWRNaW5XaWR0aCA9IDIwO1xuICAgIHByaXZhdGUgY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IDIwO1xuICAgIHByaXZhdGUgZXhpZlRyYW5zZm9ybTogRXhpZlRyYW5zZm9ybSA9IHtyb3RhdGU6IDAsIGZsaXA6IGZhbHNlfTtcbiAgICBwcml2YXRlIGF1dG9Sb3RhdGVTdXBwb3J0ZWQ6IFByb21pc2U8Ym9vbGVhbj4gPSBzdXBwb3J0c0F1dG9tYXRpY1JvdGF0aW9uKCk7XG4gICAgcHJpdmF0ZSBzdGVwU2l6ZSA9IDM7XG5cbiAgICBzYWZlSW1nRGF0YVVybDogU2FmZVVybCB8IHN0cmluZztcbiAgICBzYWZlVHJhbnNmb3JtU3R5bGU6IFNhZmVTdHlsZSB8IHN0cmluZztcbiAgICBtYXJnaW5MZWZ0OiBTYWZlU3R5bGUgfCBzdHJpbmcgPSAnMHB4JztcbiAgICBtYXhTaXplOiBEaW1lbnNpb25zO1xuICAgIGltYWdlVmlzaWJsZSA9IGZhbHNlO1xuICAgIG1vdmVUeXBlcyA9IE1vdmVUeXBlcztcblxuICAgIEBWaWV3Q2hpbGQoJ3dyYXBwZXInLCB7c3RhdGljOiB0cnVlfSkgd3JhcHBlcjogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdzb3VyY2VJbWFnZScsIHtzdGF0aWM6IGZhbHNlfSkgc291cmNlSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICBASW5wdXQoKSBpbWFnZUNoYW5nZWRFdmVudDogYW55O1xuICAgIEBJbnB1dCgpIGltYWdlVVJMOiBzdHJpbmc7XG4gICAgQElucHV0KCkgaW1hZ2VCYXNlNjQ6IHN0cmluZztcbiAgICBASW5wdXQoKSBpbWFnZUZpbGU6IEZpbGU7XG5cbiAgICBASW5wdXQoKSBmb3JtYXQ6ICdwbmcnIHwgJ2pwZWcnIHwgJ2JtcCcgfCAnd2VicCcgfCAnaWNvJyA9ICdwbmcnO1xuICAgIEBJbnB1dCgpIG1haW50YWluQXNwZWN0UmF0aW8gPSB0cnVlO1xuICAgIEBJbnB1dCgpIHRyYW5zZm9ybTogSW1hZ2VUcmFuc2Zvcm0gPSB7fTtcbiAgICBASW5wdXQoKSBhc3BlY3RSYXRpbyA9IDE7XG4gICAgQElucHV0KCkgcmVzaXplVG9XaWR0aCA9IDA7XG4gICAgQElucHV0KCkgcmVzaXplVG9IZWlnaHQgPSAwO1xuICAgIEBJbnB1dCgpIGNyb3BwZXJNaW5XaWR0aCA9IDA7XG4gICAgQElucHV0KCkgY3JvcHBlck1pbkhlaWdodCA9IDA7XG4gICAgQElucHV0KCkgY2FudmFzUm90YXRpb24gPSAwO1xuICAgIEBJbnB1dCgpIGluaXRpYWxTdGVwU2l6ZSA9IDM7XG4gICAgQElucHV0KCkgcm91bmRDcm9wcGVyID0gZmFsc2U7XG4gICAgQElucHV0KCkgb25seVNjYWxlRG93biA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIGltYWdlUXVhbGl0eSA9IDkyO1xuICAgIEBJbnB1dCgpIGF1dG9Dcm9wID0gdHJ1ZTtcbiAgICBASW5wdXQoKSBiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZztcbiAgICBASW5wdXQoKSBjb250YWluV2l0aGluQXNwZWN0UmF0aW8gPSBmYWxzZTtcbiAgICBASW5wdXQoKSBoaWRlUmVzaXplU3F1YXJlcyA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIGNyb3BwZXI6IENyb3BwZXJQb3NpdGlvbiA9IHtcbiAgICAgICAgeDE6IC0xMDAsXG4gICAgICAgIHkxOiAtMTAwLFxuICAgICAgICB4MjogMTAwMDAsXG4gICAgICAgIHkyOiAxMDAwMFxuICAgIH07XG4gICAgQEhvc3RCaW5kaW5nKCdzdHlsZS50ZXh0LWFsaWduJylcbiAgICBASW5wdXQoKSBhbGlnbkltYWdlOiAnbGVmdCcgfCAnY2VudGVyJyA9ICdjZW50ZXInO1xuICAgIEBIb3N0QmluZGluZygnY2xhc3MuZGlzYWJsZWQnKVxuICAgIEBJbnB1dCgpIGRpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJbWFnZUNyb3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgc3RhcnRDcm9wSW1hZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlTG9hZGVkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBjcm9wcGVyUmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyPERpbWVuc2lvbnM+KCk7XG4gICAgQE91dHB1dCgpIGxvYWRJbWFnZUZhaWxlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbkNoYW5nZXNJbnB1dEltYWdlKGNoYW5nZXMpO1xuXG4gICAgICAgIGlmICh0aGlzLm9yaWdpbmFsSW1hZ2UgJiYgdGhpcy5vcmlnaW5hbEltYWdlLmNvbXBsZXRlICYmIHRoaXMuZXhpZlRyYW5zZm9ybVxuICAgICAgICAgICAgJiYgKGNoYW5nZXMuY29udGFpbldpdGhpbkFzcGVjdFJhdGlvIHx8IGNoYW5nZXMuY2FudmFzUm90YXRpb24pKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybU9yaWdpbmFsSW1hZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlcy5jcm9wcGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNldE1heFNpemUoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q3JvcHBlclNjYWxlZE1pblNpemUoKTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tDcm9wcGVyUG9zaXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLmFzcGVjdFJhdGlvICYmIHRoaXMuaW1hZ2VWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0Q3JvcHBlclBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMudHJhbnNmb3JtKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtIHx8IHt9O1xuICAgICAgICAgICAgdGhpcy5zZXRDc3NUcmFuc2Zvcm0oKTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZXNJbnB1dEltYWdlKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuaW1hZ2VDaGFuZ2VkRXZlbnQgfHwgY2hhbmdlcy5pbWFnZVVSTCB8fCBjaGFuZ2VzLmltYWdlQmFzZTY0IHx8IGNoYW5nZXMuaW1hZ2VGaWxlKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRDcm9wcGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMuaW1hZ2VDaGFuZ2VkRXZlbnQgJiYgdGhpcy5pc1ZhbGlkSW1hZ2VDaGFuZ2VkRXZlbnQoKSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKHRoaXMuaW1hZ2VDaGFuZ2VkRXZlbnQudGFyZ2V0LmZpbGVzWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlcy5pbWFnZVVSTCAmJiB0aGlzLmltYWdlVVJMKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwodGhpcy5pbWFnZVVSTCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMuaW1hZ2VCYXNlNjQgJiYgdGhpcy5pbWFnZUJhc2U2NCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkQmFzZTY0SW1hZ2UodGhpcy5pbWFnZUJhc2U2NCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMuaW1hZ2VGaWxlICYmIHRoaXMuaW1hZ2VGaWxlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZpbGUodGhpcy5pbWFnZUZpbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhbGlkSW1hZ2VDaGFuZ2VkRXZlbnQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlQ2hhbmdlZEV2ZW50XG4gICAgICAgICAgICAmJiB0aGlzLmltYWdlQ2hhbmdlZEV2ZW50LnRhcmdldFxuICAgICAgICAgICAgJiYgdGhpcy5pbWFnZUNoYW5nZWRFdmVudC50YXJnZXQuZmlsZXNcbiAgICAgICAgICAgICYmIHRoaXMuaW1hZ2VDaGFuZ2VkRXZlbnQudGFyZ2V0LmZpbGVzLmxlbmd0aCA+IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDc3NUcmFuc2Zvcm0oKSB7XG4gICAgICAgIHRoaXMuc2FmZVRyYW5zZm9ybVN0eWxlID0gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFN0eWxlKFxuICAgICAgICAgICAgJ3NjYWxlWCgnICsgKHRoaXMudHJhbnNmb3JtLnNjYWxlIHx8IDEpICogKHRoaXMudHJhbnNmb3JtLmZsaXBIID8gLTEgOiAxKSArICcpJyArXG4gICAgICAgICAgICAnc2NhbGVZKCcgKyAodGhpcy50cmFuc2Zvcm0uc2NhbGUgfHwgMSkgKiAodGhpcy50cmFuc2Zvcm0uZmxpcFYgPyAtMSA6IDEpICsgJyknICtcbiAgICAgICAgICAgICdyb3RhdGUoJyArICh0aGlzLnRyYW5zZm9ybS5yb3RhdGUgfHwgMCkgKyAnZGVnKSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdGVwU2l6ZSA9IHRoaXMuaW5pdGlhbFN0ZXBTaXplO1xuICAgICAgICB0aGlzLmFjdGl2YXRlUGluY2hHZXN0dXJlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0Q3JvcHBlcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zYWZlSW1nRGF0YVVybCA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZydcbiAgICAgICAgICAgICsgJ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQzBsRVFWUVlWMk5nQUFJQUFBVSdcbiAgICAgICAgICAgICsgJ0FBYXJWeUZFQUFBQUFTVVZPUks1Q1lJST0nO1xuICAgICAgICB0aGlzLm1vdmVTdGFydCA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICB4MTogMCxcbiAgICAgICAgICAgIHkxOiAwLFxuICAgICAgICAgICAgeDI6IDAsXG4gICAgICAgICAgICB5MjogMCxcbiAgICAgICAgICAgIGNsaWVudFg6IDAsXG4gICAgICAgICAgICBjbGllbnRZOiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWF4U2l6ZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3JpZ2luYWxTaXplID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZFNpemUgPSB7XG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAtMTAwO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAtMTAwO1xuICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSAxMDAwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gMTAwMDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkSW1hZ2UoaW1hZ2VCYXNlNjQ6IHN0cmluZywgaW1hZ2VUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZEltYWdlVHlwZShpbWFnZVR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRCYXNlNjRJbWFnZShpbWFnZUJhc2U2NCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRJbWFnZUZpbGUoZmlsZTogRmlsZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSAoZXZlbnQ6IGFueSkgPT4gdGhpcy5sb2FkSW1hZ2UoZXZlbnQudGFyZ2V0LnJlc3VsdCwgZmlsZS50eXBlKTtcbiAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZEltYWdlVHlwZSh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIC9pbWFnZVxcLyhwbmd8anBnfGpwZWd8Ym1wfGdpZnx0aWZmfHdlYnApLy50ZXN0KHR5cGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZEJhc2U2NEltYWdlKGltYWdlQmFzZTY0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hdXRvUm90YXRlU3VwcG9ydGVkXG4gICAgICAgICAgICAudGhlbigoc3VwcG9ydGVkOiBib29sZWFuKSA9PiB0aGlzLmNoZWNrRXhpZkFuZExvYWRCYXNlNjRJbWFnZShpbWFnZUJhc2U2NCwgc3VwcG9ydGVkKSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMudHJhbnNmb3JtT3JpZ2luYWxJbWFnZSgpKVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRmFpbGVkLmVtaXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxCYXNlNjQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0V4aWZBbmRMb2FkQmFzZTY0SW1hZ2UoaW1hZ2VCYXNlNjQ6IHN0cmluZywgYXV0b1JvdGF0ZVN1cHBvcnRlZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxCYXNlNjQgPSBpbWFnZUJhc2U2NDtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aWZUcmFuc2Zvcm0gPSBnZXRUcmFuc2Zvcm1hdGlvbnNGcm9tRXhpZkRhdGEoYXV0b1JvdGF0ZVN1cHBvcnRlZCA/IC0xIDogaW1hZ2VCYXNlNjQpO1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxTaXplLndpZHRoID0gdGhpcy5vcmlnaW5hbEltYWdlLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQgPSB0aGlzLm9yaWdpbmFsSW1hZ2UubmF0dXJhbEhlaWdodDtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2Uuc3JjID0gaW1hZ2VCYXNlNjQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZEltYWdlRnJvbVVSTCh1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICAgICAgICAgIHRoaXMubG9hZEJhc2U2NEltYWdlKGNhbnZhcy50b0RhdGFVUkwoKSk7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnO1xuICAgICAgICBpbWcuc3JjID0gdXJsO1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJhbnNmb3JtT3JpZ2luYWxJbWFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLm9yaWdpbmFsSW1hZ2UgfHwgIXRoaXMub3JpZ2luYWxJbWFnZS5jb21wbGV0ZSB8fCAhdGhpcy5leGlmVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdObyBpbWFnZSBsb2FkZWQnKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRCYXNlNjQgPSB0aGlzLnRyYW5zZm9ybUltYWdlQmFzZTY0KCk7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFRyYW5zZm9ybWVkSW1hZ2UodHJhbnNmb3JtZWRCYXNlNjQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJhbnNmb3JtSW1hZ2VCYXNlNjQoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY2FudmFzUm90YXRpb24gPSB0aGlzLmNhbnZhc1JvdGF0aW9uICsgdGhpcy5leGlmVHJhbnNmb3JtLnJvdGF0ZTtcbiAgICAgICAgaWYgKGNhbnZhc1JvdGF0aW9uID09PSAwICYmICF0aGlzLmV4aWZUcmFuc2Zvcm0uZmxpcCAmJiAhdGhpcy5jb250YWluV2l0aGluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9yaWdpbmFsQmFzZTY0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRTaXplID0gdGhpcy5nZXRUcmFuc2Zvcm1lZFNpemUoKTtcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHRyYW5zZm9ybWVkU2l6ZS53aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHRyYW5zZm9ybWVkU2l6ZS5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKFxuICAgICAgICAgICAgdGhpcy5leGlmVHJhbnNmb3JtLmZsaXAgPyAtMSA6IDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICBjYW52YXMud2lkdGggLyAyLFxuICAgICAgICAgICAgY2FudmFzLmhlaWdodCAvIDJcbiAgICAgICAgKTtcbiAgICAgICAgY3R4LnJvdGF0ZShNYXRoLlBJICogKGNhbnZhc1JvdGF0aW9uIC8gMikpO1xuICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLFxuICAgICAgICAgICAgLXRoaXMub3JpZ2luYWxTaXplLndpZHRoIC8gMixcbiAgICAgICAgICAgIC10aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQgLyAyXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUcmFuc2Zvcm1lZFNpemUoKTogRGltZW5zaW9ucyB7XG4gICAgICAgIGNvbnN0IGNhbnZhc1JvdGF0aW9uID0gdGhpcy5jYW52YXNSb3RhdGlvbiArIHRoaXMuZXhpZlRyYW5zZm9ybS5yb3RhdGU7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5XaXRoaW5Bc3BlY3RSYXRpbykge1xuICAgICAgICAgICAgaWYgKGNhbnZhc1JvdGF0aW9uICUgMikge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pbldpZHRoVG9Db250YWluID0gdGhpcy5vcmlnaW5hbFNpemUud2lkdGggKiB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pbkhlaWdodFRvQ29udGFpbiA9IHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCwgbWluV2lkdGhUb0NvbnRhaW4pLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KHRoaXMub3JpZ2luYWxTaXplLndpZHRoLCBtaW5IZWlnaHRUb0NvbnRhaW4pLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pbldpZHRoVG9Db250YWluID0gdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBjb25zdCBtaW5IZWlnaHRUb0NvbnRhaW4gPSB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KHRoaXMub3JpZ2luYWxTaXplLndpZHRoLCBtaW5XaWR0aFRvQ29udGFpbiksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgodGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0LCBtaW5IZWlnaHRUb0NvbnRhaW4pLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FudmFzUm90YXRpb24gJSAyKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5vcmlnaW5hbFNpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0VHJhbnNmb3JtZWRJbWFnZSh0cmFuc2Zvcm1lZEJhc2U2NCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRCYXNlNjQgPSB0cmFuc2Zvcm1lZEJhc2U2NDtcbiAgICAgICAgICAgIHRoaXMuc2FmZUltZ0RhdGFVcmwgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwodHJhbnNmb3JtZWRCYXNlNjQpO1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRTaXplLndpZHRoID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkU2l6ZS5oZWlnaHQgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2UubmF0dXJhbEhlaWdodDtcbiAgICAgICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2Uuc3JjID0gdGhpcy50cmFuc2Zvcm1lZEJhc2U2NDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkZWRJblZpZXcoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zZm9ybWVkSW1hZ2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZUxvYWRlZC5lbWl0KCk7XG4gICAgICAgICAgICB0aGlzLnNldEltYWdlTWF4U2l6ZVJldHJpZXMgPSAwO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmNoZWNrSW1hZ2VNYXhTaXplUmVjdXJzaXZlbHkoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrSW1hZ2VNYXhTaXplUmVjdXJzaXZlbHkoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNldEltYWdlTWF4U2l6ZVJldHJpZXMgPiA0MCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGYWlsZWQuZW1pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc291cmNlSW1hZ2VMb2FkZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0Q3JvcHBlclBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJSZWFkeS5lbWl0KHsuLi50aGlzLm1heFNpemV9KTtcbiAgICAgICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldEltYWdlTWF4U2l6ZVJldHJpZXMrKztcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jaGVja0ltYWdlTWF4U2l6ZVJlY3Vyc2l2ZWx5KCksIDUwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc291cmNlSW1hZ2VMb2FkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvdXJjZUltYWdlICYmIHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudCAmJiB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggPiAwO1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpyZXNpemUnKVxuICAgIG9uUmVzaXplKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlc2l6ZUNyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB0aGlzLnNldE1heFNpemUoKTtcbiAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWN0aXZhdGVQaW5jaEdlc3R1cmUoKSB7XG4gICAgICAgIGlmICh0aGlzLkhhbW1lcikge1xuICAgICAgICAgICAgY29uc3QgaGFtbWVyID0gbmV3IHRoaXMuSGFtbWVyKHRoaXMud3JhcHBlci5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgICAgIGhhbW1lci5nZXQoJ3BpbmNoJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICAgICAgICAgIGhhbW1lci5vbigncGluY2htb3ZlJyx0aGlzLm9uUGluY2guYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBoYW1tZXIub24oJ3BpbmNoZW5kJyx0aGlzLnBpbmNoU3RvcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGhhbW1lci5vbigncGluY2hzdGFydCcsdGhpcy5zdGFydFBpbmNoLmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tOZ3hJbWFnZUNyb3BwZXJdIENvdWxkIG5vdCBmaW5kIEhhbW1lckpTIC0gUGluY2ggR2VzdHVyZSB3b25cXCd0IHdvcmsnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplQ3JvcHBlclBvc2l0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLm1heFNpemUud2lkdGggIT09IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCB8fCB0aGlzLm1heFNpemUuaGVpZ2h0ICE9PSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSB0aGlzLmNyb3BwZXIueDEgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLm1heFNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDIgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLm1heFNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLmNyb3BwZXIueTEgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gdGhpcy5tYXhTaXplLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MiAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgLyB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzZXRDcm9wcGVyUG9zaXRpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKCF0aGlzLm1haW50YWluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvIDwgc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIGNvbnN0IGNyb3BwZXJIZWlnaHQgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gKHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgLSBjcm9wcGVySGVpZ2h0KSAvIDI7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTEgKyBjcm9wcGVySGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCBjcm9wcGVyV2lkdGggPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0ICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLSBjcm9wcGVyV2lkdGgpIC8gMjtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArIGNyb3BwZXJXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRvQXV0b0Nyb3AoKTtcbiAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGtleWJvYXJkQWNjZXNzKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VLZXlib2FyZFN0ZXBTaXplKGV2ZW50KTtcbiAgICAgICAgdGhpcy5rZXlib2FyZE1vdmVDcm9wcGVyKGV2ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUtleWJvYXJkU3RlcFNpemUoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID49ICcxJyAmJiBldmVudC5rZXkgPD0gJzknKSB7XG4gICAgICAgICAgICB0aGlzLnN0ZXBTaXplID0gK2V2ZW50LmtleTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUga2V5Ym9hcmRNb3ZlQ3JvcHBlcihldmVudCkge1xuICAgICAgICBjb25zdCBrZXlib2FyZFdoaXRlTGlzdDogc3RyaW5nW10gPSBbJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ0Fycm93UmlnaHQnLCAnQXJyb3dMZWZ0J107XG4gICAgICAgIGlmICghKGtleWJvYXJkV2hpdGVMaXN0LmluY2x1ZGVzKGV2ZW50LmtleSkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbW92ZVR5cGUgPSBldmVudC5zaGlmdEtleSA/IE1vdmVUeXBlcy5SZXNpemUgOiBNb3ZlVHlwZXMuTW92ZTtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBldmVudC5hbHRLZXkgPyB0aGlzLmdldEludmVydGVkUG9zaXRpb25Gb3JLZXkoZXZlbnQua2V5KSA6IHRoaXMuZ2V0UG9zaXRpb25Gb3JLZXkoZXZlbnQua2V5KTtcbiAgICAgICAgY29uc3QgbW92ZUV2ZW50ID0gdGhpcy5nZXRFdmVudEZvcktleShldmVudC5rZXksIHRoaXMuc3RlcFNpemUpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5zdGFydE1vdmUoe2NsaWVudFg6IDAsIGNsaWVudFk6IDB9LCBtb3ZlVHlwZSwgcG9zaXRpb24pO1xuICAgICAgICB0aGlzLm1vdmVJbWcobW92ZUV2ZW50KTtcbiAgICAgICAgdGhpcy5tb3ZlU3RvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UG9zaXRpb25Gb3JLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0b3AnO1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdyaWdodCc7XG4gICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYm90dG9tJztcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEludmVydGVkUG9zaXRpb25Gb3JLZXkoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdib3R0b20nO1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdsZWZ0JztcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0b3AnO1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdyaWdodCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEV2ZW50Rm9yS2V5KGtleTogc3RyaW5nLCBzdGVwU2l6ZTogbnVtYmVyKTogYW55IHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7Y2xpZW50WDogMCwgY2xpZW50WTogc3RlcFNpemUgKiAtMX07XG4gICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge2NsaWVudFg6IHN0ZXBTaXplLCBjbGllbnRZOiAwfTtcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtjbGllbnRYOiAwLCBjbGllbnRZOiBzdGVwU2l6ZX07XG4gICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4ge2NsaWVudFg6IHN0ZXBTaXplICogLTEsIGNsaWVudFk6IDB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnRNb3ZlKGV2ZW50OiBhbnksIG1vdmVUeXBlOiBNb3ZlVHlwZXMsIHBvc2l0aW9uOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQgJiYgdGhpcy5tb3ZlU3RhcnQuYWN0aXZlICYmIHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09IE1vdmVUeXBlcy5QaW5jaCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1vdmVTdGFydCA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHR5cGU6IG1vdmVUeXBlLFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBjbGllbnRYOiB0aGlzLmdldENsaWVudFgoZXZlbnQpLFxuICAgICAgICAgICAgY2xpZW50WTogdGhpcy5nZXRDbGllbnRZKGV2ZW50KSxcbiAgICAgICAgICAgIC4uLnRoaXMuY3JvcHBlclxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXJ0UGluY2goZXZlbnQ6IGFueSkge1xuICAgICAgICBpZiAoIXRoaXMuc2FmZUltZ0RhdGFVcmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb3ZlU3RhcnQgPSB7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB0eXBlOiBNb3ZlVHlwZXMuUGluY2gsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2NlbnRlcicsXG4gICAgICAgICAgICBjbGllbnRYOiB0aGlzLmNyb3BwZXIueDEgKyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIDIsXG4gICAgICAgICAgICBjbGllbnRZOiB0aGlzLmNyb3BwZXIueTEgKyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyLnkxKSAvIDIsXG4gICAgICAgICAgICAuLi50aGlzLmNyb3BwZXJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZW1vdmUnLCBbJyRldmVudCddKVxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OnRvdWNobW92ZScsIFsnJGV2ZW50J10pXG4gICAgbW92ZUltZyhldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm1vdmVTdGFydC5hY3RpdmUpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQudHlwZSA9PT0gTW92ZVR5cGVzLk1vdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tDcm9wcGVyUG9zaXRpb24odHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09IE1vdmVUeXBlcy5SZXNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUGluY2goZXZlbnQ6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQuYWN0aXZlKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09IE1vdmVUeXBlcy5QaW5jaCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzaXplKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRNYXhTaXplKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5zb3VyY2VJbWFnZSkge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5tYXhTaXplLndpZHRoID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgdGhpcy5tYXhTaXplLmhlaWdodCA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLm1hcmdpbkxlZnQgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0U3R5bGUoJ2NhbGMoNTAlIC0gJyArIHRoaXMubWF4U2l6ZS53aWR0aCAvIDIgKyAncHgpJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy50cmFuc2Zvcm1lZEltYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5XaWR0aCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluSGVpZ2h0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCA9IDIwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0ID0gMjA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENyb3BwZXJTY2FsZWRNaW5XaWR0aCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggPSB0aGlzLmNyb3BwZXJNaW5XaWR0aCA+IDBcbiAgICAgICAgICAgID8gTWF0aC5tYXgoMjAsIHRoaXMuY3JvcHBlck1pbldpZHRoIC8gdGhpcy50cmFuc2Zvcm1lZEltYWdlLndpZHRoICogdGhpcy5tYXhTaXplLndpZHRoKVxuICAgICAgICAgICAgOiAyMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENyb3BwZXJTY2FsZWRNaW5IZWlnaHQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm1haW50YWluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IE1hdGgubWF4KDIwLCB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCAvIHRoaXMuYXNwZWN0UmF0aW8pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY3JvcHBlck1pbkhlaWdodCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IE1hdGgubWF4KDIwLCB0aGlzLmNyb3BwZXJNaW5IZWlnaHQgLyB0aGlzLnRyYW5zZm9ybWVkSW1hZ2UuaGVpZ2h0ICogdGhpcy5tYXhTaXplLmhlaWdodCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQgPSAyMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tDcm9wcGVyUG9zaXRpb24obWFpbnRhaW5TaXplID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci54MSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSBtYWludGFpblNpemUgPyB0aGlzLmNyb3BwZXIueDEgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLnkxIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IG1haW50YWluU2l6ZSA/IHRoaXMuY3JvcHBlci55MSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueDIgPiB0aGlzLm1heFNpemUud2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSAtPSBtYWludGFpblNpemUgPyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoKSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLm1heFNpemUud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci55MiA+IHRoaXMubWF4U2l6ZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSAtPSBtYWludGFpblNpemUgPyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCkgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5tYXhTaXplLmhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50Om1vdXNldXAnKVxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OnRvdWNoZW5kJylcbiAgICBtb3ZlU3RvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlU3RhcnQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRvQXV0b0Nyb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBpbmNoU3RvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlU3RhcnQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRvQXV0b0Nyb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbW92ZShldmVudDogYW55KSB7XG4gICAgICAgIGNvbnN0IGRpZmZYID0gdGhpcy5nZXRDbGllbnRYKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFg7XG4gICAgICAgIGNvbnN0IGRpZmZZID0gdGhpcy5nZXRDbGllbnRZKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFk7XG5cbiAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gdGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWTtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZShldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRpZmZYID0gdGhpcy5nZXRDbGllbnRYKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFg7XG4gICAgICAgIGNvbnN0IGRpZmZZID0gdGhpcy5nZXRDbGllbnRZKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5tb3ZlU3RhcnQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcGxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbXJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbWxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2VudGVyJzpcbiAgICAgICAgICAgICAgICBjb25zdCBzY2FsZSA9IGV2ZW50LnNjYWxlO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1dpZHRoID0gKE1hdGguYWJzKHRoaXMubW92ZVN0YXJ0LngyIC0gdGhpcy5tb3ZlU3RhcnQueDEpKSAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IChNYXRoLmFicyh0aGlzLm1vdmVTdGFydC55MiAtIHRoaXMubW92ZVN0YXJ0LnkxKSkgKiBzY2FsZTtcbiAgICAgICAgICAgICAgICBjb25zdCB4MSA9IHRoaXMuY3JvcHBlci54MTtcbiAgICAgICAgICAgICAgICBjb25zdCB5MSA9IHRoaXMuY3JvcHBlci55MTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC5jbGllbnRYIC0gKG5ld1dpZHRoIC8gMiksIHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC5jbGllbnRZIC0gKG5ld0hlaWdodCAvIDIpLCB0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LmNsaWVudFggKyAobmV3V2lkdGggLyAyKSwgeDEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQuY2xpZW50WSArIChuZXdIZWlnaHQgLyAyKSwgeTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWFpbnRhaW5Bc3BlY3RSYXRpbykge1xuICAgICAgICAgICAgdGhpcy5jaGVja0FzcGVjdFJhdGlvKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrQXNwZWN0UmF0aW8oKTogdm9pZCB7XG4gICAgICAgIGxldCBvdmVyZmxvd1ggPSAwO1xuICAgICAgICBsZXQgb3ZlcmZsb3dZID0gMDtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMubW92ZVN0YXJ0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXIueTEpICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueTEsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyLnkxKSAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiAob3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5jcm9wcGVyLnkyIC0gKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueDEsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueTEsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMuY3JvcHBlci55MiAtICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueTEsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgY2FzZSAnYm90dG9tcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MSArICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICBjYXNlICdib3R0b21sZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTEgKyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci54MSwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXIueTEpICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTEgKyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgY29uc3Qgb3ZlcmZsb3dYMSA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueDEsIDApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJmbG93WDIgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJmbG93WTEgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVyZmxvd1kyID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WDEgPiAwIHx8IG92ZXJmbG93WDIgPiAwIHx8IG92ZXJmbG93WTEgPiAwIHx8IG92ZXJmbG93WTIgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSArPSAob3ZlcmZsb3dZMSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYMSA/IChvdmVyZmxvd1kxICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1gxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WTIgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WDIgPyAob3ZlcmZsb3dZMiAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYMjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxICs9IChvdmVyZmxvd1kyICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1gyID8gb3ZlcmZsb3dZMiA6IG92ZXJmbG93WDIgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WTEgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WDEgPyBvdmVyZmxvd1kxIDogb3ZlcmZsb3dYMSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkb0F1dG9Dcm9wKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hdXRvQ3JvcCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcm9wKCk6IEltYWdlQ3JvcHBlZEV2ZW50IHwgbnVsbCB7XG4gICAgICAgIGlmICh0aGlzLnNvdXJjZUltYWdlICYmIHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudCAmJiB0aGlzLnRyYW5zZm9ybWVkSW1hZ2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydENyb3BJbWFnZS5lbWl0KCk7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVBvc2l0aW9uID0gdGhpcy5nZXRJbWFnZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IGltYWdlUG9zaXRpb24ueDIgLSBpbWFnZVBvc2l0aW9uLngxO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gaW1hZ2VQb3NpdGlvbi55MiAtIGltYWdlUG9zaXRpb24ueTE7XG5cbiAgICAgICAgICAgIGNvbnN0IGNyb3BDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgICAgIGNyb3BDYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIGNyb3BDYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgICAgICBjb25zdCBjdHggPSBjcm9wQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYmFja2dyb3VuZENvbG9yICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZENvbG9yO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NhbGVYID0gKHRoaXMudHJhbnNmb3JtLnNjYWxlIHx8IDEpICogKHRoaXMudHJhbnNmb3JtLmZsaXBIID8gLTEgOiAxKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzY2FsZVkgPSAodGhpcy50cmFuc2Zvcm0uc2NhbGUgfHwgMSkgKiAodGhpcy50cmFuc2Zvcm0uZmxpcFYgPyAtMSA6IDEpO1xuXG4gICAgICAgICAgICAgICAgY3R4LnNldFRyYW5zZm9ybShzY2FsZVgsIDAsIDAsIHNjYWxlWSwgdGhpcy50cmFuc2Zvcm1lZFNpemUud2lkdGggLyAyLCB0aGlzLnRyYW5zZm9ybWVkU2l6ZS5oZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKC1pbWFnZVBvc2l0aW9uLngxIC8gc2NhbGVYLCAtaW1hZ2VQb3NpdGlvbi55MSAvIHNjYWxlWSk7XG4gICAgICAgICAgICAgICAgY3R4LnJvdGF0ZSgodGhpcy50cmFuc2Zvcm0ucm90YXRlIHx8IDApICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLnRyYW5zZm9ybWVkSW1hZ2UsIC10aGlzLnRyYW5zZm9ybWVkU2l6ZS53aWR0aCAvIDIsIC10aGlzLnRyYW5zZm9ybWVkU2l6ZS5oZWlnaHQgLyAyKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dDogSW1hZ2VDcm9wcGVkRXZlbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUG9zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGNyb3BwZXJQb3NpdGlvbjogey4uLnRoaXMuY3JvcHBlcn1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRhaW5XaXRoaW5Bc3BlY3RSYXRpbykge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQub2Zmc2V0SW1hZ2VQb3NpdGlvbiA9IHRoaXMuZ2V0T2Zmc2V0SW1hZ2VQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByZXNpemVSYXRpbyA9IHRoaXMuZ2V0UmVzaXplUmF0aW8od2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZVJhdGlvICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC53aWR0aCA9IE1hdGgucm91bmQod2lkdGggKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5oZWlnaHQgPSB0aGlzLm1haW50YWluQXNwZWN0UmF0aW9cbiAgICAgICAgICAgICAgICAgICAgICAgID8gTWF0aC5yb3VuZChvdXRwdXQud2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBNYXRoLnJvdW5kKGhlaWdodCAqIHJlc2l6ZVJhdGlvKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplQ2FudmFzKGNyb3BDYW52YXMsIG91dHB1dC53aWR0aCwgb3V0cHV0LmhlaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dHB1dC5iYXNlNjQgPSB0aGlzLmNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZC5lbWl0KG91dHB1dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEltYWdlUG9zaXRpb24oKTogQ3JvcHBlclBvc2l0aW9uIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBjb25zdCByYXRpbyA9IHRoaXMudHJhbnNmb3JtZWRTaXplLndpZHRoIC8gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuXG4gICAgICAgIGNvbnN0IG91dDogQ3JvcHBlclBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDE6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLngxICogcmF0aW8pLFxuICAgICAgICAgICAgeTE6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLnkxICogcmF0aW8pLFxuICAgICAgICAgICAgeDI6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLngyICogcmF0aW8pLFxuICAgICAgICAgICAgeTI6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLnkyICogcmF0aW8pXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5XaXRoaW5Bc3BlY3RSYXRpbykge1xuICAgICAgICAgICAgb3V0LngxID0gTWF0aC5tYXgob3V0LngxLCAwKTtcbiAgICAgICAgICAgIG91dC55MSA9IE1hdGgubWF4KG91dC55MSwgMCk7XG4gICAgICAgICAgICBvdXQueDIgPSBNYXRoLm1pbihvdXQueDIsIHRoaXMudHJhbnNmb3JtZWRTaXplLndpZHRoKTtcbiAgICAgICAgICAgIG91dC55MiA9IE1hdGgubWluKG91dC55MiwgdGhpcy50cmFuc2Zvcm1lZFNpemUuaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRPZmZzZXRJbWFnZVBvc2l0aW9uKCk6IENyb3BwZXJQb3NpdGlvbiB7XG4gICAgICAgIGNvbnN0IGNhbnZhc1JvdGF0aW9uID0gdGhpcy5jYW52YXNSb3RhdGlvbiArIHRoaXMuZXhpZlRyYW5zZm9ybS5yb3RhdGU7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgcmF0aW8gPSB0aGlzLnRyYW5zZm9ybWVkU2l6ZS53aWR0aCAvIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgbGV0IG9mZnNldFg6IG51bWJlcjtcbiAgICAgICAgbGV0IG9mZnNldFk6IG51bWJlcjtcblxuICAgICAgICBpZiAoY2FudmFzUm90YXRpb24gJSAyKSB7XG4gICAgICAgICAgICBvZmZzZXRYID0gKHRoaXMudHJhbnNmb3JtZWRTaXplLndpZHRoIC0gdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0KSAvIDI7XG4gICAgICAgICAgICBvZmZzZXRZID0gKHRoaXMudHJhbnNmb3JtZWRTaXplLmhlaWdodCAtIHRoaXMub3JpZ2luYWxTaXplLndpZHRoKSAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvZmZzZXRYID0gKHRoaXMudHJhbnNmb3JtZWRTaXplLndpZHRoIC0gdGhpcy5vcmlnaW5hbFNpemUud2lkdGgpIC8gMjtcbiAgICAgICAgICAgIG9mZnNldFkgPSAodGhpcy50cmFuc2Zvcm1lZFNpemUuaGVpZ2h0IC0gdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0KSAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvdXQ6IENyb3BwZXJQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHgxOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MSAqIHJhdGlvKSAtIG9mZnNldFgsXG4gICAgICAgICAgICB5MTogTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueTEgKiByYXRpbykgLSBvZmZzZXRZLFxuICAgICAgICAgICAgeDI6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLngyICogcmF0aW8pIC0gb2Zmc2V0WCxcbiAgICAgICAgICAgIHkyOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci55MiAqIHJhdGlvKSAtIG9mZnNldFlcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIXRoaXMuY29udGFpbldpdGhpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICBvdXQueDEgPSBNYXRoLm1heChvdXQueDEsIDApO1xuICAgICAgICAgICAgb3V0LnkxID0gTWF0aC5tYXgob3V0LnkxLCAwKTtcbiAgICAgICAgICAgIG91dC54MiA9IE1hdGgubWluKG91dC54MiwgdGhpcy50cmFuc2Zvcm1lZFNpemUud2lkdGgpO1xuICAgICAgICAgICAgb3V0LnkyID0gTWF0aC5taW4ob3V0LnkyLCB0aGlzLnRyYW5zZm9ybWVkU2l6ZS5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBjcm9wQ2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvJyArIHRoaXMuZm9ybWF0LCB0aGlzLmdldFF1YWxpdHkoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRRdWFsaXR5KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB0aGlzLmltYWdlUXVhbGl0eSAvIDEwMCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmVzaXplUmF0aW8od2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5yZXNpemVUb1dpZHRoID4gMCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9ubHlTY2FsZURvd24gfHwgd2lkdGggPiB0aGlzLnJlc2l6ZVRvV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVUb1dpZHRoIC8gd2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXNpemVUb0hlaWdodCA+IDApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vbmx5U2NhbGVEb3duIHx8IGhlaWdodCA+IHRoaXMucmVzaXplVG9IZWlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVUb0hlaWdodCAvIGhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsaWVudFgoZXZlbnQ6IGFueSk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAoZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdID8gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYIDogZXZlbnQuY2xpZW50WCkgfHwgMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsaWVudFkoZXZlbnQ6IGFueSk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAoZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdID8gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZIDogZXZlbnQuY2xpZW50WSkgfHwgMDtcbiAgICB9XG59XG4iXX0=