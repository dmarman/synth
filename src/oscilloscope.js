class Oscilloscope
{
    constructor()
    {
        this.canvas = document.querySelector('#scope');
        this.context = this.canvas.getContext('2d');
        this.size = 2048
    }

    input(analyser)
    {
        this.analyser = analyser
        analyser.size = this.size;
        this.start()
    }

    setNote(note)
    {
        this.note = note;
    }

    start()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let draw = () => {
            let x = 0;
            let dataArray = this.analyser.getValue();
    
            this.context.fillStyle = '#273330';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
            this.context.lineWidth = 2;
            this.context.strokeStyle = '#00f399';
    
            this.context.beginPath();

            let period = (44100 / this.note)*2
            let last;
			let start = 0;
			for (var i = 0; i < dataArray.length; i++) {
				if (last > 0 && dataArray[i] <= 0) {
					start = i;
					break;
                }
				last = dataArray[i];
            }
            let max = Math.max(...dataArray);
			max = max < 1 ? 1 : max;
			var sliceWidth = (this.canvas.width * 1) / period;
    
            for(let j = 0; j < this.size; j++) {
                var v = (dataArray[j + start] * 200) / (max * 2);
				var y = v + this.canvas.height / 2;
                x = sliceWidth * j;
                if(j === 0) {
                    this.context.moveTo(x, y);
                } else {
                    this.context.lineTo(x, y);
                }
            }

            this.context.stroke();
            drawVisual = requestAnimationFrame(draw);
          };
    
          draw();
    
    }
}

module.exports = new Oscilloscope();