import {
  flatten,
  flow,
  chunk,
  clamp,
  curryRight,
} from './utils';

const magnifier = document.createElement('canvas');
export interface IConfig {
  range:number;
  scale:number;
}

export class ColorPicker {
  private canvas:HTMLCanvasElement;
  private magnifier = magnifier;
  private config:IConfig;
  private current_color:string = '';
  constructor(canvas:HTMLCanvasElement, config:IConfig = {range:40, scale:4}) {
    config.range = Math.ceil(config.range);
    config.range = config.range % 2 ? config.range : config.range + 1;
    config.scale = Math.ceil(config.scale);
    this.canvas = canvas;
    this.config = config;
    const magnifier_width = this.config.scale * this.config.range;
    const magnifier_height = magnifier_width;
    this.magnifier.width = magnifier_width;
    this.magnifier.height = magnifier_height;
  }

  private get_pixels (x:number, y:number, range:number = this.config.range, background_color = [255, 255, 255, 255]) {
    const left = Math.floor(x - (range - 1) / 2);
    let top = Math.floor(y - (range - 1) / 2);
    const ctx = this.canvas.getContext('2d') || this.canvas.getContext('webgl');
    let result:number[] = [];
    if (ctx instanceof CanvasRenderingContext2D) {
      result = ctx.getImageData(left, top, range, range).data as any as number[];
    } else if (ctx instanceof WebGLRenderingContext) {
      top = Math.floor(this.canvas.height - y - 1 - (range - 1) / 2);
      const pixels = new Uint8Array(range * range * 4);
      const temp = new Uint8Array(range * 4);
      ctx.readPixels(
        left, top, range, range, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);
      const halfHeight = range / 2 | 0;  // the | 0 keeps the result an int
      const bytesPerRow = range * 4;

      // make a temp buffer to hold one row
      for (let i = 0; i < halfHeight; ++i) {
        const topOffset = i * bytesPerRow;
        const bottomOffset = (range - i - 1) * bytesPerRow;

        // make copy of a row on the top half
        temp.set(pixels.subarray(topOffset, topOffset + bytesPerRow));

        // copy a row from the bottom half to the top
        pixels.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);

        // copy the copy of the top half row to the bottom half
        pixels.set(temp, bottomOffset);
      }
      result = pixels as any as number[];
    }

    // set background color
    const is_out_of_stage = (index:number) => {
      const current_top = Math.floor(y - (range - 1) / 2);
      const x_offset = index % this.config.range;
      const y_offset = Math.floor(index / this.config.range);
      const pos = {
        x:left + x_offset,
        y:current_top + y_offset,
      };
      if (clamp(pos.x, 0, this.canvas.width - 1) !== pos.x) {
        return true;
      } else if (clamp(pos.y, 0, this.canvas.height - 1) !== pos.y) {
        return true;
      }
      return false;
    };

    const split = curryRight(chunk)(4);

    const get_background_color = (pixels:number[][]) =>
      pixels.map((pixel:number[], index) => {
        if (is_out_of_stage(index)) {
          return [255, 255, 255, 255];
        }
        return pixel;
      });

    return flow([
      split,
      get_background_color,
      flatten,
    ])(result);
  }

  public get_current_color() {
    return this.current_color;
  }

  private get_x_index_of_area(area_index:number) {
    return area_index % this.config.range;
  }

  private get_y_index_of_area(area_index:number) {
    return Math.floor(area_index / this.config.range);
  }

  private get_real_x(x_index_of_area:number) {
    return x_index_of_area * this.config.scale;
  }

  private get_real_y(y_index_of_area:number) {
    return y_index_of_area * this.config.scale;
  }

  private get_x_of_area(area_index:number) {
    return this.get_real_x(this.get_x_index_of_area(area_index));
  }

  private get_y_of_area(area_index:number) {
    return this.get_real_y(this.get_y_index_of_area(area_index));
  }

  public get_magnifier(x:number, y:number) {
    x = Math.floor(x);
    y = Math.floor(y);
    const top = Math.floor(x - (this.config.range - 1) / 2);
    const left = Math.floor(y - (this.config.range - 1) / 2);
    const datas = this.get_pixels(x, y);
    const magnifier_ctx = this.magnifier.getContext('2d') as CanvasRenderingContext2D;

    // reset canvas
    magnifier_ctx.clearRect(0, 0, this.magnifier.width, this.magnifier.height);

    const split = curryRight(chunk)(4);
    const amplify =
      (pixels:number[][]) => 
      pixels.map((pixel:number[]) => {
        const result:number[] = [];
        for (let i = 0; i < this.config.scale; i++) {
          for (let j = 0; j < this.config.scale; j++) {
            result.push(pixel[0]);
            result.push(pixel[1]);
            result.push(pixel[2]);
            result.push(pixel[3]);
          }
        }
        return result;
      });

    const draw = (pixels:number[][]) =>
      pixels.forEach((pixel, index) => {
        const magnifier_imageData = magnifier_ctx.createImageData(this.config.scale, this.config.scale);
        magnifier_imageData.data.set(pixel);
        const real_x = this.get_x_of_area(index);
        const real_y = this.get_y_of_area(index);
        magnifier_ctx.putImageData(magnifier_imageData, real_x , real_y);
      });

    const draw_selecting = () => {
      const real_x = this.get_real_x(x - top);
      const real_y = this.get_real_y(y - left);
      magnifier_ctx.save();
      magnifier_ctx.strokeStyle = '#000000';
      magnifier_ctx.lineWidth = 1;
      magnifier_ctx.strokeRect(real_x - 1, real_y - 1, this.config.scale + 2, this.config.scale + 2);
      magnifier_ctx.strokeStyle = '#FFFFFF';
      magnifier_ctx.lineWidth = 1;
      magnifier_ctx.strokeRect(real_x - 2, real_y - 2, this.config.scale + 4, this.config.scale + 4);
      magnifier_ctx.restore();
    };

    const select_color = () => {
      const pixel = this.get_pixels(x, y, 1);
      // this.current_color = rgb_to_hex(pixel[0], pixel[1], pixel[2]);
    };

    const draw_to_ctx = flow([
      split,
      amplify,
      draw,
    ]);

    const select = flow([
      draw_selecting,
      select_color,
    ]);
    draw_to_ctx(datas);
    select();
    return this.magnifier;
  }
}

export function get_color_picker(range:number, scale:number) {
  const canvas = document.createElement('canvas');
  return new ColorPicker(canvas, {range, scale});
}