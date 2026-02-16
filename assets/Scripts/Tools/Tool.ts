const {ccclass, property} = cc._decorator;
@ccclass
export default class Tool{
 
    static getRandomNum(min,max){
        let minx = Math.ceil(min);
        let maxx = Math.floor(max);
        return Math.floor(Math.random()*(maxx - minx + 1) + minx);
    }
 
    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    static getNodePath(node: cc.Node): string{
        var str = node.name;
        while(node != cc.Canvas.instance.node){
            node = node.parent;
            str = node.name + "/" + str;
        }
        return str;
    }

    static vstringToCoord(str: string): cc.Vec3 {
        // 使用正则表达式匹配字符串中的数字
        const regex = /\((-?\d+),\s*(-?\d+)\)/;
        const match = str.match(regex);
        if (match) {
            // 使用提取的数字创建一个cc.Vec2对象
            return new cc.Vec3(parseInt(match[1]), parseInt(match[2]));
        } else {
            // 如果字符串格式不正确，返回null或其他错误处理
            return null;
        }
    }

        /**
     * 将数字转换为中文汉字表示
     * @param num 要转换的数字
     * @returns 转换后的中文汉字字符串
     */
    static numberToChinese(num: number): string {
        const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千'];
        const bigUnits = ['', '万', '亿'];
    
        if (num === 0) {
            return chineseNumbers[0];
        }
    
        // 处理个位数的情况
        if (num < 10) {
            return chineseNumbers[num];
        }
    
        let result = '';
        let groupIndex = 0;
    
        while (num > 0) {
            const group = num % 10000;
            let groupStr = '';
            let isZero = false;
    
            for (let i = 0; i < 4; i++) {
                const digit = Math.floor(group / Math.pow(10, i)) % 10;
                if (digit === 0) {
                    if (!isZero) {
                        groupStr = chineseNumbers[0] + groupStr;
                        isZero = true;
                    }
                } else {
                    groupStr = chineseNumbers[digit] + (i > 0 ? units[i] : '') + groupStr;
                    isZero = false;
                }
            }
    
            // 去除多余的零
            groupStr = groupStr.replace(/零+$/, '');
            groupStr = groupStr.replace(/零+/g, '零');
    
            if (groupStr) {
                result = groupStr + bigUnits[groupIndex] + result;
            }
    
            num = Math.floor(num / 10000);
            groupIndex++;
        }
    
        // 处理一十的情况
        if (result.startsWith('一十')) {
            result = result.slice(1);
        }
    
        return result;
    }

    /**
     * 将 Date 时间数据转换为 "X 分 X 秒" 的格式
     * @param durationDate 代表持续时间的 Date 对象
     * @returns 格式化后的时间字符串
     */
    static formatDateToMinutesAndSeconds(durationSeconds: number): string {
        const minutes = Math.floor(durationSeconds / (1000 * 60));
        const seconds = Math.floor((durationSeconds % (1000 * 60)) / 1000);
        return `${minutes}分${seconds}秒`;
    }

    //#region base64
    static _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    static base64Encode(str: string): string {
        var t;
        var o;
        var i;
        var n;
        var a;
        var s;
        var r;
        var c = "";
        var l = 0;
        for (str = this.utf8_encode(str); l < str.length;) {
        n = (t = str.charCodeAt(l++)) >> 2;
        a = (3 & t) << 4 | (o = str.charCodeAt(l++)) >> 4;
        s = (15 & o) << 2 | (i = str.charCodeAt(l++)) >> 6;
        r = 63 & i;
        if (isNaN(o)) {
            s = r = 64;
        } else {
            isNaN(i) && (r = 64);
        }
        c = c + this._keyStr.charAt(n) + this._keyStr.charAt(a) + this._keyStr.charAt(s) + this._keyStr.charAt(r);
        }
        return c;
    }

    static base64Decode(e: string): string {
        var t;
        var o;
        var i;
        var n;
        var a;
        var s;
        var r = "";
        var c = 0;
        for (e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); c < e.length;) {
        t = this._keyStr.indexOf(e.charAt(c++)) << 2 | (n = this._keyStr.indexOf(e.charAt(c++))) >> 4;
        o = (15 & n) << 4 | (a = this._keyStr.indexOf(e.charAt(c++))) >> 2;
        i = (3 & a) << 6 | (s = this._keyStr.indexOf(e.charAt(c++)));
        r += String.fromCharCode(t);
        64 != a && (r += String.fromCharCode(o));
        64 != s && (r += String.fromCharCode(i));
        }
        return this.utf8_decode(r);
    }

    static utf8_encode = function (e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var o = 0; o < e.length; o++) {
          var i = e.charCodeAt(o);
          if (i < 128) {
            t += String.fromCharCode(i);
          } else if (i > 127 && i < 2048) {
            t += String.fromCharCode(i >> 6 | 192);
            t += String.fromCharCode(63 & i | 128);
          } else {
            t += String.fromCharCode(i >> 12 | 224);
            t += String.fromCharCode(i >> 6 & 63 | 128);
            t += String.fromCharCode(63 & i | 128);
          }
        }
        return t;
      };

      static utf8_decode = function (e) {
        var t;
        var o = "";
        var i = 0;
        var n = 0;
        for (var a = 0; i < e.length;) {
          if ((n = e.charCodeAt(i)) < 128) {
            o += String.fromCharCode(n);
            i++;
          } else if (n > 191 && n < 224) {
            a = e.charCodeAt(i + 1);
            o += String.fromCharCode((31 & n) << 6 | 63 & a);
            i += 2;
          } else {
            a = e.charCodeAt(i + 1);
            t = e.charCodeAt(i + 2);
            o += String.fromCharCode((15 & n) << 12 | (63 & a) << 6 | 63 & t);
            i += 3;
          }
        }
        return o;
      };
    //#endregion
}