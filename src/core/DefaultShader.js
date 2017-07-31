/**
 * Copyright Metrological, 2017
 */

let Shader = require('./Shader');

class DefaultShader extends Shader {

    constructor(vertexShaderSource = DefaultShader.vertexShaderSource, fragmentShaderSource = DefaultShader.fragmentShaderSrc) {
        super(vertexShaderSource, fragmentShaderSource);
    }

    init(vboContext) {
        super.init(vboContext);

        let gl = vboContext.gl;

        // Bind attributes.
        this._vertexPositionAttribute = gl.getAttribLocation(this.glProgram, "aVertexPosition");
        this._textureCoordAttribute = gl.getAttribLocation(this.glProgram, "aTextureCoord");
        this._colorAttribute = gl.getAttribLocation(this.glProgram, "aColor");

        // Set transformation matrix.
        this._projectionMatrixAttribute = gl.getUniformLocation(this.glProgram, "projectionMatrix");
    }

    setup(vboContext) {
        let gl = vboContext.gl;

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        gl.vertexAttribPointer(this._vertexPositionAttribute, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(this._textureCoordAttribute, 2, gl.UNSIGNED_SHORT, true, 16, 2 * 4);
        gl.vertexAttribPointer(this._colorAttribute, 4, gl.UNSIGNED_BYTE, true, 16, 3 * 4);

        gl.enableVertexAttribArray(this._vertexPositionAttribute);
        gl.enableVertexAttribArray(this._textureCoordAttribute);
        gl.enableVertexAttribArray(this._colorAttribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vboContext.quadsGlBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, vboContext.paramsGlBuffer);

        this.setupExtra(vboContext);
    }

    drawElements(vboContext, offset, length) {
        let gl = vboContext.gl;

        if (length) {
            gl.useProgram(this.glProgram);
            gl.uniformMatrix4fv(this._projectionMatrixAttribute, false, vboContext.projectionMatrix);

            let view = new DataView(vboContext.vboParamsBuffer, offset * vboContext.bytesPerQuad, length * vboContext.bytesPerQuad);
            gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);

            let glTexture = vboContext.getVboGlTexture(0);
            let pos = offset;
            let end = offset + length;
            for (let i = offset; i < end; i++) {
                let tx = vboContext.getVboGlTexture(i);
                if (glTexture !== tx) {
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, pos * 6 * 2);
                    glTexture = tx;
                }
            }
            if (pos < end) {
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                gl.drawElements(gl.TRIANGLES, 6 * (end - pos), gl.UNSIGNED_SHORT, pos * 6 * 2);
            }
        }
    }

    cleanup(vboContext) {
        let gl = vboContext.gl;

        gl.disableVertexAttribArray(this._vertexPositionAttribute);
        gl.disableVertexAttribArray(this._textureCoordAttribute);
        gl.disableVertexAttribArray(this._colorAttribute);

        this.cleanupExtra(vboContext);
    }

    setupExtra(vboContext) {
        // Set up additional params.
    }

    cleanupExtra(vboContext) {
        // Clean up additional params.
    }

}

DefaultShader.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aColor;
    uniform mat4 projectionMatrix;
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aColor;
    }
`;

DefaultShader.fragmentShaderSrc = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    void main(void){
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
    }
`;

DefaultShader.prototype.isDefaultShader = true;

module.exports = DefaultShader;