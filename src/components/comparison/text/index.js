import s from './../styles.scss';
import Comparison from '../';

export default class ComparisonText extends Comparison {
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return div;
        }
            console.log(this.model.dict, this.data.field);
        div.innerHTML = this.returnTemplate(0) + this.returnTemplate(1);
        

        return div;
    }
    update(msg, data){ // some here could be in the super
        var index = parseInt(msg.split('.')[1]);
        console.log(index);
        super.update(index,data);
        console.log(this, index);
        this.el.children[index].fadeInContent(this.returnTemplate(index));
        //this.el.innerHTML = this.returnTemplate(index);

    }
    returnTemplate(i){
        return `<p class="${s.chartLabel} ${s.chartLabelText}">${this.matches[i].state}: <span class="${s['compareColor' + (i +1)]}">${this.model.dict[this.data.field] !== undefined ? this.model.dict[this.data.field][[this.matches[i][this.data.field]]] : this.matches[i][this.data.field]}</span></p>`;
    }
}
