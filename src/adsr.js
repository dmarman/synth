class Adsr 
{
    constructor(className)
    {
        this.curent = 1;
        this.total = 0;

        this.canvas = document.querySelector(className);
        this.ctx = this.canvas.getContext('2d');
    }

    draw(env) {
        // reset variables
        this.total = Number(env.attack) + Number(env.decay) + Number(env.release);
        this.curent = 1;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Attack
        this.ctx.beginPath();
        this.ctx.moveTo(1, 100);

        this.ctx.lineTo(env.attack / this.total * 100 + this.curent, 2);
        this.ctx.arc(env.attack / this.total * 100 + this.curent + 1, 2, 2, 0, 2 * Math.PI)
        this.curent += env.attack / this.total * 100;

        // Decay
        this.ctx.lineTo(env.decay / this.total * 100 + this.curent + 4, 99 - env.sustain * 97);
        this.ctx.arc(env.decay / this.total * 100 + this.curent + 4, 99 - env.sustain * 97, 2, 0, 2 * Math.PI)

        this.curent += env.decay / this.total * 100;

        // Sustain
        this.ctx.lineTo(this.curent + 75, 99 - env.sustain * 97);
        this.ctx.arc(this.curent + 75, 99 - env.sustain * 97, 2, 0, 2 * Math.PI)
        this.curent += 75;

        // Release
        this.ctx.lineTo(env.release / this.total * 100 + this.curent, 100);
        this.ctx.arc(env.release / this.total * 100 + this.curent, 100, 2, 0, 2 * Math.PI)

        this.curent += env.release / this.total * 100;

        // stroke
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#0093f3';
        this.ctx.stroke();
        this.ctx.closePath();
    }
}


module.exports = Adsr;