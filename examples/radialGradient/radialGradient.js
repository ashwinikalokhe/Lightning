const wuf = require('../../wuf')

class RadialGradientExample extends wuf.Application {

    static _template() {
        return {
            Gradient: {shader: {type: wuf.shaders.RadialGradientShader, color: 0xFFFF00FF, x: 450, y: 450, radiusX: 500, radiusY: 300}, rect: true, color: 0xFF0000FF, y: 0, w: 900, h: 900}
        }
    }

}

const options = {stage: {w: 900, h: 900, glClearColor: 0xFF000000}}
const app = new RadialGradientExample(options);

