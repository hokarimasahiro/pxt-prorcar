/*
  robot car control block for poroCar
*/

enum Position {
    //% block=Left
    Left = 1,
    //% block=Right
    Right = 2,
    //% block=Both
    Both = 0
}
enum lineColor {
    //% block=black
    Black = 0,
    //% block=white
    White = 1
}
/**
 * Well known colors for a NeoPixel strip
 */
enum RGBColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

//% color=#006464 weight=20 icon="\uf1b9" block="poroCar"
namespace porocar {
    //% shim=sendBufferAsm
    function sendBufferAsm(buf: Buffer, pin: DigitalPin) {
    }

    let initFlag = 0;
    let stripPin = DigitalPin.P0;
    let _length = 8
    let buf = pins.createBuffer(_length * 3);
    let brightness: number;
    let threshold = 500;

    function init() {
        if (initFlag == 0) {
            initFlag = 1;
        }
    }

    function setPwmMotor(speedL: number, speedR: number): void {
        if (speedL >= 0) {
            pins.digitalWritePin(DigitalPin.P14, 0)
            pins.analogWritePin(AnalogPin.P13, speedL * 4);
        } else {
            pins.digitalWritePin(DigitalPin.P13, 0)
            pins.analogWritePin(AnalogPin.P14, (0 - speedL) * 4);
        }
        if (speedR >= 0) {
            pins.digitalWritePin(DigitalPin.P15, 0)
            pins.analogWritePin(AnalogPin.P16, speedR * 4);
        } else {
            pins.digitalWritePin(DigitalPin.P16, 0)
            pins.analogWritePin(AnalogPin.P15, (0 - speedR) * 4);
        }
    }

    /**
     * Run a car at a specified speed.
     * @param speedL Left Moter Power in -255 to 255. eg:50
     * @param speedR Right Motor Power in -255 to 255. eg:50
     */
    //% weight=90 blockGap=8
    //% blockId="CarCtrl" block="CarCtrl| left %speedL| right %speedR"
    //% speedL.min=-255 speedL.max=255 speedR.min=-255 speedR.max=255
    export function carCtrl(speedL: number, speedR: number): void {

        let wSpeedL = Math.constrain(speedL, -255, 255);
        let wSpeedR = Math.constrain(speedR, -255, 255);

        setPwmMotor(wSpeedL, wSpeedR);
    }

    /**
     * Sense a line color for number
     */
    //% weight=85 blockGap=8
    //% blockId="get_line_color_N" block="lineColorN|direct %direct"
    export function getLineColorN(direct: Position): number {
        if (direct == Position.Left)
            return (pins.analogReadPin(AnalogPin.P1) < threshold ? lineColor.White : lineColor.Black);
        else (direct == Position.Right)
            return (pins.analogReadPin(AnalogPin.P2) < threshold ? lineColor.White : lineColor.Black);
    }
    /**
     * Sense a line color.
     */
    //% weight=80 blockGap=8
    //% blockId="get_line_color" block="lineColor|direct %direct|color %color"
    export function getLineColor(direct: Position, color: lineColor): boolean {
        return getLineColorN(direct) == color;
    }

    /**
     * Get Distance.
     */
    //% weight=75 blockGap=8
    //% blockId="Get_distance" block="get distance(cm)"
    export function getDistance(): number {

        const usParCm = 43 //58    // 1000000[uS] / (340[m/S](sped of sound) * 100(cm)) * 2(round trip)
        let pinT: number
        let pinR: number
        let distance: number;

        pinT = DigitalPin.P2
        pinR = DigitalPin.P1

        pins.setPull(pinT, PinPullMode.PullNone);
        pins.digitalWritePin(pinT, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pinT, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pinT, 0);

        distance = pins.pulseIn(pinR, PulseValue.High, 800 * usParCm);

        return distance / usParCm;
    }

    /**
     * show barGraph.
     * @param l Left level in -255 to 255. eg:50
     * @param r Right level in -255 to 255. eg:50
     */
    //% weight=70 blockGap=8
    //% blockId="plotBarGraph" block="plotBarGraph|%l|%r"
    //% l.min=-255 l.max=255 r.min=-255 r.max=255
    export function plotBarGraph(l: number, r: number): void {

        let wl = Math.constrain(Math.trunc(l / 25), -9, 9);
        let wr = Math.constrain(Math.trunc(r / 25), -9, 9);

        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 2; x++) {
                if (wl >= 0) {
                    if (wl > (y * 2 + x)) {
                        led.plot(1 - x, 4 - y)
                    } else {
                        led.unplot(1 - x, 4 - y)
                    }
                } else {
                    if ((0 - wl) > (4 - y) * 2 + x) {
                        led.plot(1 - x, 4 - y);
                    } else {
                        led.unplot(1 - x, 4 - y);
                    }
                }
                if (wr >= 0) {
                    if (wr > (y * 2 + x)) {
                        led.plot(3 + x, 4 - y)
                    } else {
                        led.unplot(3 + x, 4 - y)
                    }
                } else {
                    if ((0 - wr) > (4 - y) * 2 + x) {
                        led.plot(3 + x, 4 - y);
                    } else {
                        led.unplot(3 + x, 4 - y);
                    }
                }
            }
        }
    }

    /**
     * Shows all LEDs to a given color (range 0-255 for r, g, b). 
     * @param rgb RGB color of the LED
     */
    //% weight=65 blockGap=8
    //% blockId="set_set_color" block="set neo color %rgb=carcontrol_colors"
    export function setNeoColor(rgb: number) {
        rgb = rgb >> 0;
        setAllRGB(rgb);
        show();
    }
    /**
     * Set LED to a given color (range 0-255 for r, g, b). 
     * You need to call ``show`` to make the changes visible.
     * @param pixeloffset position of the Neo
     * @param rgb RGB color of the LED
     */
    //% weight=60 blockGap=8
    //% blockId="et_neo_pixel_color" block="set neo pixel color at %pixeloffset|to %rgb=carcontrol_colors"
    export function setNeoPixelColor(pixeloffset: number, rgb: number): void {
        rgb = rgb >> 0;
        setPixelRGB(pixeloffset >> 0, rgb);
        show();
    }

    /**
     * Send all the changes to the strip.
     */
    //% blockId="neopixel_show" block="%strip|show"
    //% advanced=true
    export function show() {
        let Pin: DigitalPin

        sendBufferAsm(buf, stripPin);
    }

    /**
     * Turn off all LEDs.
     * You need to call ``show`` to make the changes visible.
     */
    //% blockId="neopixel_clear" block="%strip|clear"
    //% advanced=true
    export function clear(): void {
        buf.fill(0, 0, _length * 3);
        show()
    }
    /**
     * Set NeoPixel brightness.
     * @param bright in 0-255. eg:50
     */
    //% weight=55 blockGap=8
    //% blockId="set_Neo_Brightness" block="set Neo Brightness %bright"
    //% bright.min=0 bright.max=255
    export function setNeoBrightness(bright: number): void {

        brightness = bright
    }
    function setBufferRGB(offset: number, red: number, green: number, blue: number): void {
        buf[offset + 0] = green;
        buf[offset + 1] = red;
        buf[offset + 2] = blue;
    }

    function setAllRGB(rgb: number) {
        let red = unpackR(rgb);
        let green = unpackG(rgb);
        let blue = unpackB(rgb);

        const br = brightness;
        if (br < 255) {
            red = (red * br) >> 8;
            green = (green * br) >> 8;
            blue = (blue * br) >> 8;
        }
        for (let i = 0; i < _length; ++i) {
            setBufferRGB(i * 3, red, green, blue)
        }
    }
    function setPixelRGB(pixeloffset: number, rgb: number): void {
        if (pixeloffset < 0
            || pixeloffset >= _length)
            return;

        pixeloffset = pixeloffset * 3;

        let red = unpackR(rgb);
        let green = unpackG(rgb);
        let blue = unpackB(rgb);

        let br = brightness;
        if (br < 255) {
            red = (red * br) >> 8;
            green = (green * br) >> 8;
            blue = (blue * br) >> 8;
        }
        setBufferRGB(pixeloffset, red, green, blue)
    }
    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=50 blockGap=8
    //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    function changeRandG(rgb: number): number {
        return packRGB(unpackG(rgb), unpackR(rgb), unpackB(rgb));
    }

    /**
     * Gets the RGB value of a known color
    */
    //% weight=45 blockGap=8
    //% blockId="carcontrol_colors" block="%color"
    export function colors(color: RGBColors): number {
        return color;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }
}
