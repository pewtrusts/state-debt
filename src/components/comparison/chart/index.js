import s from './../styles.scss';
import Comparison from '../';



export default class ComparisonText extends Comparison {
    prerender(){
        var div = super.prerender(),
            scales;
        if ( this.prerendered && this.rerender) {
            return div;
        }
        scales = [this.linearScale(this.matches[0], this.data.field), this.linearScale(this.matches[1], this.data.field)];
        function partialTemplate(index){
            return `
                    <p class="${s.chartLabel} ${s['chartLabel' + (index + 1)]}">
                        ${this.matches[index].state}
                    </p>
                    <div class="${s.barContainer} ${s['barContainer' + (index + 1)]}">
                        <div class="${s.bar} ${s['compareColor' + ( index + 1 )]}" style="transform: scaleX(${scales[index]})"></div>
                        <div class="${s.dataLabel}" style="transform: translateX(${( scales[index] * 100).toFixed(1) }%)">
                            ${this.formatValue(this.matches[index], this.data.field)}
                        </div>
                    </div>
            `;
        }
        div.innerHTML = ` 
                        <div class="${s.chartContainer}">
                            ${partialTemplate.call(this, 0)}
                            ${partialTemplate.call(this, 1)}
                        </div>
                       `;
        

        return div;
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
    init(){
    }
}
