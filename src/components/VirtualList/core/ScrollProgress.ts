import { ScrollProgressConfig } from './_type';
import { inRange } from './helpers';

export default class ScrollProgress {
  private minSY: number;
  private minCY: number;
  private maxSY: number;
  private maxCY: number;

  private offset: number;
  private endPoint: number;
  private curPoint: number;

  onUpdate: () => void = () => {};

  constructor(config: ScrollProgressConfig) {
    this.minSY = config.minSY;
    this.minCY = config.minCY;
    this.maxSY = config.maxSY;
    this.maxCY = config.maxCY;

    this.offset = config.offset;

    this.curPoint = config.scrollTop / (this.maxCY - this.minCY);
    this.endPoint = this.curPoint;
  }

  setOnUpdate(callback: () => void) {
    this.onUpdate = callback;
  }

  setEndPoint(val: number) {
    const limitedVal = inRange(val - this.offset, this.minSY, this.maxSY);
    this.endPoint = limitedVal / this.maxSY;
  }

  move(stepC: number) {
    const step = ScrollProgress.getPercent(stepC, this.minCY, this.maxCY);
    const sign = Math.sign(this.endPoint - this.curPoint);

    let result = this.curPoint + sign * step;
    if (sign > 0 && result > this.endPoint) result = this.endPoint;
    else if (sign < 0 && result < this.endPoint) result = this.endPoint;

    this.curPoint = inRange(result, 0, 100);

    this.onUpdate();
  }

  canMove() {
    return Math.abs(this.endPoint - this.curPoint) > 0.001;
  }

  getPositionC() {
    return this.curPoint * (this.maxCY - this.minCY) + this.minCY;
  }

  getCoefficient() {
    const dist = Math.abs(this.endPoint - this.curPoint);

    if (dist > 75) return 20;
    if (dist > 50) return 15;
    if (dist > 25) return 10;
    return 2;
  }

  static getPercent(val: number, min: number, max: number) {
    return (val - min) / (max - min);
  }
}
