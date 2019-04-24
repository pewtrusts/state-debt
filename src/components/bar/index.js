import s from './styles.scss';
import Element from '@UI/element';

 export default class Bar extends Element {
    
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return div;
        }
        div.classList.add(s.bar, s['barColor' + this.data.color]);
        div.style.transform = `translateX(${this.placeZero(this.data.field) * 100 + '%'}) scaleX(${this.linearScale(this.data.d, this.data.field)})`;

        return div;
    }
    linearScale(match, field){
        var typeObject = this.model.types.find(t => t.field === field),
            scale = ( match[field] - typeObject.min ) / typeObject.spread,
            zeroPlacement = this.placeZero(field),
            offset = typeObject.crossesZero ? 0 : .01,
            adjusted = offset + ( scale * ( 1 - offset) ) - zeroPlacement;
        return adjusted;
    }
    placeZero(field){
        var typeObject = this.model.types.find(t => t.field === field),
            raw = ( 0 - typeObject.min ) / typeObject.spread;
        return raw > 0 ? raw : 0;
    }
    update(){
        // in development mode, this.el is a js object but does not refer to element rendered on the page
        //var el = process.env.NODE_ENV === 'development' ? document.querySelector(`.js-bar-compare-${this.data.field}-${index}`) : this.el;
        console.log('THIS',this); 
        window.requestAnimationFrame(() => {
            this.el.style.transform = `translateX(${this.placeZero(this.data.field) * 100 + '%'}) scaleX(${this.linearScale(this.data.d, this.data.field)})`;
        });       
    }

}