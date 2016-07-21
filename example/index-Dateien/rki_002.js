(function () {
    $.rki = $.rki || {};


    $.rki.chart = $.rki.chart || {};
    $.rki.chart.map = $.rki.chart.map || {};
    $.rki.chart.map.create = function (config) {
        var _defaults = {
            element: undefined,
            height: 500,
        };
        var _settings = $.extend({}, _defaults, config);

        var _layout;
        var _projection = d3.geo.mercator()
            .scale(1)
            .center([0, 0])
            .translate([0, 0]);
        var _geoPath = d3.geo.path().projection(_projection);
        var _layers = [];

        /**
       * Creates the layout with created elements and the measured size. If there
       * are already elements, nothing will be added or measured.
       * @param {HtmlSelector} The target selector for the element where the layout will be inserted
       * @return {Layout} The created layout inside given target
       */
        var _createLayout = function (target) {
            var elements = { root: d3.select(target) };
            elements.container = elements.root.select("div.svg-container");

            var size = {}
            if (elements.container.empty()) {
                elements.container = elements.root.append("div")
                    .classed("svg-container", true);

                size.width = parseInt(elements.container.style("width"), 10);
                size.height = _settings.height || parseInt(elements.container.style("height"), 10);
                elements.container.style({
                    "padding-bottom": ((size.height / size.width) * 100) + "%",
                });
            } else {
                size.width = parseInt(elements.container.style("width"), 10);
                size.height = parseInt(elements.container.style("height"), 10);
            }

            elements.svg = elements.container.select("svg");
            if (elements.svg.empty()) {
                elements.svg = elements.container.append("svg")
                    .attr({
                        "viewBox": "0 0 " + size.width + " " + size.height,
                        "preserveAspectRatio": "xMidYMid meet"
                    });
            }

            return {
                elements: elements,
                size: size
            }
        }

        var _createLayer = function (layerName, featureCollection, pathCall) {

            var layerG = _layout.elements.svg.select("g." + layerName);

            //var render = function () {
            //    layerG.selectAll("path").attr("d", _geoPath);
            //    if (pathCall) pathes.call(pathCall);
            //}

            var render = function () {
                var selection = layerG.selectAll("path").attr("d", _geoPath);
                if (pathCall) selection.call(pathCall);
            }

            if (layerG.empty()) {
                layerG = _layout.elements.svg.append("g").classed(layerName, true);

                var pathes = layerG.selectAll("path")
                    .data(featureCollection.features);

                pathes.enter().append("path");
                render();
            }

            return {
                name: layerName,
                g: layerG,
                featureCollection: featureCollection,
                render: render
            }
        }

        var _renderLayers = function() {
            _layers.forEach(function (l) { l.render(); });
        }

        var _centerLayer = function (layer) {
            _projection
                .scale(1)
                .center([0, 0])
                .translate([0, 0]);
            
            var b = _geoPath.bounds(layer.featureCollection);

            var scale = .95 / Math.max((b[1][0] - b[0][0]) / _layout.size.width, (b[1][1] - b[0][1]) / _layout.size.height);
            var translate = [(_layout.size.width - scale * (b[1][0] + b[0][0])) / 2, (_layout.size.height - scale * (b[1][1] + b[0][1])) / 2];

            _projection.scale(scale).translate(translate);
            _renderLayers();
        }

        _layout = _createLayout(_settings.element);

        return {
            layout: _layout,
            addLayer: function (layerName, featureCollection, callback, layerProperties) {
                var layer = _createLayer(layerName, featureCollection, callback);
                if (layerProperties) layer = $.extend({}, layerProperties, layer);
                _layers.push(layer);
                return layer;
            },
            removeLayer: function (layer) {
                var index = _layers.indexOf(layer);
                if (index != -1) {
                    _layers.splice(index, 1);
                    layer.g.remove();
                }
            },
            centerLayer: _centerLayer
        }
    }

})();