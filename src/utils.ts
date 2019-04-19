export function cloneDeep(value:any) {
  if (typeof value !== 'object') {
    return value;
  }
  if (value.length != undefined) {
    const result = [];
    for(const ele of value) {
      result.push(cloneDeep(ele));
    }
    return result;
  }
  const keys = Object.keys(value);
  const result = {};
  for(const key of keys) {
    if (typeof value[key] === 'object') {
      result[key] = cloneDeep(value[key]);
    } else {
      result[key] = value[key];
    }
  }
  return result;
}

export function flow(funcs:Function[]) {
  // console.log('=============flow=============');
  return (value?:any) => {
    let result = cloneDeep(value);
    for(const func of funcs) {
      // console.log('                 ');
      // console.log('param', result);
      // console.log('                 ');
      // console.log('result before', result);
      // console.log('                 ');
      // console.log('func', func);
      result = func(result);
      // console.log('                 ');
      // console.log('result after', result);
      // console.log('result', result);
    }
    return result;
  }
}

export function clamp(value:number, low:number, max:number) {
  if (value < low) {
    return low;
  } else if (value > max) {
    return max;
  }
  return value;
}

export function curryRight(func:Function) {
  const params = [];
  const caller = (param:any) => {
    if (params.length < func.length) {
      params.push(param);
    }
    if (params.length === func.length) {
      return func(...cloneDeep(params).reverse());
    }
    return caller;
  }
  return caller;
}

export function chunk(arr:any[], size:number) {
  if (size <= 0) {
    return [];
  }
  if (size >= arr.length) {
    return [[...arr]];
  }
  const result = [];
  let tmp_array = [];
  for (const value of arr) {
    if (tmp_array.length === size) {
      result.push(tmp_array);
      tmp_array = [value];
    } else {
      tmp_array.push(value);
    }
  }
  result.push(tmp_array);
  return result;
}

export function flatten(arr:any[]) {
  const result = [];

  for (const value of arr) {
    if (value.length != undefined) {
      for(const _value of value) {
        result.push(_value);
      }
    } else {
      result.push(value);
    }
  }
  return result;
}