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
    const split = base64Image.split(',');
    /** @type {?} */
    const type = split[0].replace('data:', '').replace(';base64', '');
    /** @type {?} */
    const byteString = atob(split[1]);
    /** @type {?} */
    const ab = new ArrayBuffer(byteString.length);
    /** @type {?} */
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvYi51dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1pbWFnZS1jcm9wcGVyLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL2Jsb2IudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxNQUFNLFVBQVUsWUFBWSxDQUFDLFdBQW1COztVQUN0QyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O1VBQzlCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQzs7VUFDM0QsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O1VBQzNCLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDOztVQUN2QyxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDO0lBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEM7SUFDRCxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9GaWxlKGJhc2U2NEltYWdlOiBzdHJpbmcpOiBCbG9iIHtcbiAgICBjb25zdCBzcGxpdCA9IGJhc2U2NEltYWdlLnNwbGl0KCcsJyk7XG4gICAgY29uc3QgdHlwZSA9IHNwbGl0WzBdLnJlcGxhY2UoJ2RhdGE6JywgJycpLnJlcGxhY2UoJztiYXNlNjQnLCAnJyk7XG4gICAgY29uc3QgYnl0ZVN0cmluZyA9IGF0b2Ioc3BsaXRbMV0pO1xuICAgIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVTdHJpbmcubGVuZ3RoKTtcbiAgICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVTdHJpbmcubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWFbaV0gPSBieXRlU3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQmxvYihbYWJdLCB7dHlwZX0pO1xufVxuIl19