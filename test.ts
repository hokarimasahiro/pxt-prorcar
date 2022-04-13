// tests go here; this will not be compiled when this package is used as a library
basic.forever(function () {
    if (input.buttonIsPressed(Button.A)) {
        porocar.carCtrl(255, 255)
    } else {
        porocar.carCtrl(0, 0)
    }
    basic.pause(100)
})
