import s from './../styles.scss';
import Comparison from '../';

export default class ComparisonText extends Comparison {
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && this.rerender) {
            return div;
        }
            console.log(this.model.dict, this.data.field);
        div.innerHTML = `
                        <p>${this.matches[0].state}: <span class="${s.compareColor1}">${this.model.dict[this.data.field] !== undefined ? this.model.dict[this.data.field][[this.matches[0][this.data.field]]] : this.matches[0][this.data.field] }</span><br />
                        ${this.matches[1].state}: <span class="${s.compareColor2}">${this.model.dict[this.data.field] !== undefined ? this.model.dict[this.data.field][[this.matches[1][this.data.field]]] : this.matches[1][this.data.field]}</span></p>
                        `;
        

        return div;
    }
    init(){
    }
}
