import s from './../styles.scss';
import Comparison from '../';
import Bar from '@Project/components/bar';
import { formatValue } from '@Project/methods';


export default class ComparisonChart extends Comparison {
    prerender(){
        var div = super.prerender();
        this.bars = [];
        [0,1].forEach(index => {
            this.bars.push(this.parent.parent.createComponent(this.model, Bar, `div.js-bar-compare-${this.data.field}-${index}`, {parent: this, data: {d: this.matches[index], field: this.data.field, color: index + 1}}))
        });
        this.children.push(...this.bars);
        if ( this.prerendered && !this.rerender) {
            return div;
        }

        
        div.innerHTML = this.returnTemplate();
        

        return div;
    }
    returnTemplate(){
        return ` 
                        <div class="${s.chartContainer}">
                            ${this.partialTemplate(0)}
                            ${this.partialTemplate(1)}
                        </div>
                       `;
    }
    returnTranslateValue(index){
        if ( this.bars[index].data.d[this.bars[index].data.field] < 0 && this.model.types.find(t => t.field === this.bars[index].data.field).crossesZero ){
            return 0;   
        } else {
            return `${( this.bars[index].linearScale(this.matches[index], this.data.field) * 100).toFixed(1) }%`;
        }
    }
    partialTemplate(index){
        return `
                <p class="${s.chartLabel} ${s['chartLabel' + (index + 1)]}">
                    ${this.matches[index].state}
                </p>
                <div class="${s.barContainer} ${s['barContainer' + (index + 1)]}">
                    ${this.bars[index].el.outerHTML}                        
                    <div class="${s.dataLabel}" style="transform: translateX(${this.returnTranslateValue.call(this, index)})">
                        ${this.formatValue(this.matches[index], this.data.field).replace('-','–')}
                    </div>
                </div>
        `;
    }
    linearScale(match, field){
        var typeObject = this.model.types.find(t => t.field === field),
            scale = ( match[field] - typeObject.min ) / typeObject.spread;

        return scale;
    }
    formatValue(){
        return formatValue.apply(this,arguments);
    }
    update(msg, data){
        console.log(msg,data);
        var index = parseInt(msg.split('.')[1]),
            dataLabel = this.el.querySelectorAll('.' + s.dataLabel)[index];
        super.update(index,data);
        
        console.log(this);
        // update label
        this.el.querySelectorAll('.' + s.chartLabel)[index].fadeInContent(this.matches[index].state);
        
        //update bars
        this.children[index].data.d = this.matches[index];
        this.children[index].update(index);
        console.log('HERE—',this.children[index].data.d);
        //update dataLabel
        dataLabel.fadeInContent(this.formatValue(this.matches[index], this.data.field).replace('-','–'));
        dataLabel.style.transform = `translateX(${this.returnTranslateValue.call(this, index)})`;
    }
}
