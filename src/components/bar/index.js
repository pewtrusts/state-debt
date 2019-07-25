import s from './styles.scss';
import Element from '@UI/element';

 export default class Bar extends Element {
    
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return div;
        }
        div.classList.add(s.bar, s['barColor' + this.data.color]);
        div.style.transform = `translateX(${this.parent.name === 'FiftyStateView' ? this.placeZero(this.data.field) * 100 + '%' : 0}) scaleX(${this.linearScale(this.data.d, this.data.field)})`;
        return div;
    }
    linearScale(match, field){
        var typeObject = this.model.types.find(t => t.field === field),
            //max = Math.max(typeObject.max, 100),
            //min = Math.min(typeObject.min, 0),
            scale = this.parent.name !== 'FiftyStateView' && typeObject.type === 'percent' ? match[field] / 1 : ( match[field] - typeObject.min ) / typeObject.spread,
            zeroPlacement = this.placeZero(field),
            offset = typeObject.crossesZero || ( this.parent.name !== 'FiftyStateView' && typeObject.type === 'percent' ) ? 0 : .01,
            adjusted = this.parent.name !== 'FiftyStateView' ? offset + ( scale * ( 1 - offset) ) : offset + ( scale * ( 1 - offset) ) - zeroPlacement;
        return adjusted;
    }
    placeZero(field){
        var typeObject = this.model.types.find(t => t.field === field),
            raw = ( 0 - typeObject.min ) / typeObject.spread;
        return raw > 0 ? raw : 0;
    }
    checkIfZero(msg){
        this.el = this.el.parentNode ? this.el : msg === undefined ? document.querySelector(`.bar-state-${this.data.d.code}`) : document.querySelector(`.js-bar-compare-${this.data.field}-${msg}`);
        if ( this.data.d[this.data.field] === 0 ){
            this.el.parentNode.classList.add(s.isZero);
        } else {
            this.el.parentNode.classList.remove(s.isZero);
        }
    }
    update(msg){
        this.el = this.el.parentNode ? this.el : msg === undefined ? document.querySelector(`.bar-state-${this.data.d.code}`) : document.querySelector(`.js-bar-compare-${this.data.field}-${msg}`);
        this.checkIfZero(msg);
        window.requestAnimationFrame(() => {
            this.el.style.transform = `translateX(${this.parent.name === 'FiftyStateView' ? this.placeZero(this.data.field) * 100 + '%' : 0}) scaleX(${this.linearScale(this.data.d, this.data.field)})`;
        });       
    }

}