import { ColorPicker } from '../../src/core';
declare function require(string): string;
// const img = require('../scenery.jpeg');


const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 800;
const ctx = canvas.getContext('2d');
const image = new Image();
document.body.appendChild(canvas);
image.src = 'https://static.codemao.cn/kitten/H1y1S6lxV';
image.crossOrigin = '';
image.onload = () => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = 'green';
  ctx.fillRect(200, 300, 200, 300);
  const color_picker = new ColorPicker(canvas, {range:30, scale:3});
  let magnifier = color_picker.get_magnifier(0, 0);
  const onmousemove = (ev:any) => {
    magnifier = color_picker.get_magnifier(ev.x, ev.y);
    magnifier.style.position = 'absolute';
    magnifier.style.top = `${ev.y - magnifier.height / 2}px`;
    magnifier.style.left = `${ev.x - magnifier.width / 2}px`;
    magnifier.style.cursor = 'none';
    document.body.append(magnifier);
  }
  window.addEventListener("mousemove", onmousemove);
}
