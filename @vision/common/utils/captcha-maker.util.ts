import {roundFloor} from "@vision/common/utils/round.util";

const { registerFont, createCanvas } = require('canvas')

export async function makeCaptcha() {

    const canvas = createCanvas(100, 40)
    registerFont('./@vision/common/utils/fonts/IRANSansMobileFN.ttf', { family: 'Iransans' });
    const ctx = canvas.getContext('2d')
    let _sym = '1234567890';
    let str = '';
    ctx.font = '22px "Iransans"'

    for( let i=0; i < 4; i++ ) {
        const txt = _sym[roundFloor(Math.random() * (_sym.length)) ];
        const x = 20 + (20 * i) ;
        ctx.strokeStyle = 'rgba(0,0,0,1)'
        const y = 25 + roundFloor(Math.random() * (_sym.length));
        ctx.fillText(txt,x, y)
        str += txt;

    }

    for ( let i=0; i < 50; i ++ ){
        ctx.rotate( i +5 );
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(Math.round(Math.random() * (99 - 2) + 2 ), Math.round(Math.random() * (48 - 4) + 4 ),Math.round(Math.random() * (90 - 30) + 30 ), 1)
    }

    const base64 = await new Promise(function(resolve, reject) {
        canvas.toDataURL('image/png', (err, png) => {
            resolve( png );
        });
    })

    return {
        data : str,
        base64 : base64
    }

}
