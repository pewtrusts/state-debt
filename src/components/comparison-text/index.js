import s from './styles.scss';
import Element from '@UI/element/';

export default class ComparisonText extends Element {
    prerender(){
        var div = super.prerender(),
        matches = [];
        if ( this.prerendered && this.rerender) {
            return div;
        }
        
        matches[0] = this.model.data.find(d => d.code === this.data.comparison[0]);
        matches[1] = this.model.data.find(d => d.code === this.data.comparison[1]);

        
        div.innerHTML = `
                        <p>${matches[0].state}: <span class="${s.compareColor1}">${matches[0][this.data.field]}</span><br />
                        ${matches[1].state}: <span class="${s.compareColor2}">${matches[1][this.data.field]}</span></p>
                        `;
        return div;
    }
    init(){
        console.log('Init ratified view')
    }
}