$(function () {
    //setTimeout(function () {
        thermometer("temp","℃","100%","100%","#e47e77", -20, 100, 0);
        thermometer("pm","μg/m3","100%","100%","#229", 0, 200, 0);
    //    thermometer("humi","%","100%","100%","#ff7850", 0, 100, 0);
    //},0)
});

function thermometer(id,unit,width,height,color, min, max,value) {
    var csatGauge = new FusionCharts({
        "type": "thermometer",
        "renderAt": id,
        "width": width,
        "height": height,
        "dataFormat": "json",
        "dataSource": {
            "chart": {
                "upperLimit": max,
                "lowerLimit": min,
                "numberSuffix": unit,
                "decimals": "1",
                "showhovereffect": "1",
                "gaugeFillColor": color,
                "gaugeBorderColor": "#008ee4",
                "showborder": "0",
                "tickmarkgap": "5",
                "theme": "fint"
            },
            "value": value
        }
    });
    csatGauge.render();
}


