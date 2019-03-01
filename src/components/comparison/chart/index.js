import s from './../styles.scss';
import Comparison from '../';
import Bar from '@Project/components/bar';


export default class ComparisonChart extends Comparison {
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && this.rerender) {
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
    partialTemplate(index){
        var bar = this.parent.parent.createComponent(this.model, Bar, `div.js-bar-compare-${this.data.field}-${index}`, {parent: this, data: {d: this.matches[index], field: this.data.field, color: index + 1}});
        return `
                <p class="${s.chartLabel} ${s['chartLabel' + (index + 1)]}">
                    ${this.matches[index].state}
                </p>
                <div class="${s.barContainer} ${s['barContainer' + (index + 1)]}">
                    ${bar.el.outerHTML}                        
                    <div class="${s.dataLabel}" style="transform: translateX(${( bar.linearScale(this.matches[index], this.data.field) * 100).toFixed(1) }%)">
                    <!--<div class="${s.dataLabel}" style="transform: translateX(0)">-->
                        ${this.formatValue(this.matches[index], this.data.field)}
                    </div>
                </div>
        `;
    }
    linearScale(match, field){
        var typeObject = this.model.types.find(t => t.field === field),
            scale = ( match[field] - typeObject.min ) / typeObject.spread;

        return scale;
    }
    formatValue(match, field){
        var style = this.model.types.find(d => d.field === field).type,
            value = match[field],
            formattedValueString;
        console.log(value);
        switch(style){
            case 'number':
                formattedValueString = value.toLocaleString('en-US', {minimumFractionDigits: 1});
                break;
            case 'currency':
                formattedValueString = value.toLocaleString('en-US', {style,currency:'USD'});
                break;
            case 'percent':
                formattedValueString = value.toLocaleString('en-US', {style, minimumFractionDigits: 1});
                break;
            default:
                formattedValueString = '[unformatted]' + value;
        }

        return formattedValueString;
    }
    update(msg, data){
        this.matches[parseInt(msg.split('.')[1])] = this.model.data.find(d => d.code === data);
        this.el.innerHTML = this.returnTemplate();
    }
}
