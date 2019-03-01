import s from './styles.scss';
import Element from '@UI/element';

 export default class Bar extends Element {
    
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && this.rerender) {
            return div;
        }
        div.classList.add(s.bar, s['barColor' + this.data.color]);
        div.style.transform = `scaleX(${this.linearScale(this.data.d, this.data.field)})`;

        return div;
    }
    linearScale(match, field){
        var typeObject = this.model.types.find(t => t.field === field),
            scale = ( match[field] - typeObject.min ) / typeObject.spread,
            adjusted = .01 + ( scale * .99 );

        return adjusted;
    }

}