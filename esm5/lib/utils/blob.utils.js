/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @param {?} base64Image
 * @return {?}
 */
export function base64ToFile(base64Image) {
    /** @type {?} */
    var split = base64Image.split(',');
    /** @type {?} */
    var type = split[0].replace('data:', '').replace(';base64', '');
    /** @type {?} */
    var byteString = atob(split[1]);
    /** @type {?} */
    var ab = new ArrayBuffer(byteString.length);
    /** @type {?} */
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: type });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvYi51dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1pbWFnZS1jcm9wcGVyLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL2Jsb2IudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxNQUFNLFVBQVUsWUFBWSxDQUFDLFdBQW1COztRQUN0QyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O1FBQzlCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQzs7UUFDM0QsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O1FBQzNCLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDOztRQUN2QyxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDO0lBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEM7SUFDRCxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLE1BQUEsRUFBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0ZpbGUoYmFzZTY0SW1hZ2U6IHN0cmluZyk6IEJsb2Ige1xuICAgIGNvbnN0IHNwbGl0ID0gYmFzZTY0SW1hZ2Uuc3BsaXQoJywnKTtcbiAgICBjb25zdCB0eXBlID0gc3BsaXRbMF0ucmVwbGFjZSgnZGF0YTonLCAnJykucmVwbGFjZSgnO2Jhc2U2NCcsICcnKTtcbiAgICBjb25zdCBieXRlU3RyaW5nID0gYXRvYihzcGxpdFsxXSk7XG4gICAgY29uc3QgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZVN0cmluZy5sZW5ndGgpO1xuICAgIGNvbnN0IGlhID0gbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZVN0cmluZy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpYVtpXSA9IGJ5dGVTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCbG9iKFthYl0sIHt0eXBlfSk7XG59XG4iXX0=