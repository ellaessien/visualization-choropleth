(function() {
    $.rki = $.rki || {};

    $.rki.utils = $.rki.utils || {};
    $.rki.utils.array = $.rki.utils.array || {};
    $.rki.utils.array.firstOrDefault = function(array, predicate, defaultValue) {
        for (var i = 0; i < array.length; i++) {
            if (predicate(array[i])) return { index: i, element: array[i] };
        }
        return defaultValue;
    }

    $.rki.utils.array.createSet = function(comparer) {
        var items = [];

        comparer = comparer || function(l, r) { return l === r; }

        var getItem = function(item) {
            var match = $.rki.utils.array.firstOrDefault(items, function(i) {
                return comparer(i, item);
            });

            return match && match.element;
        }

        // gibt 'true' zurück, wenn das element hinzugefügt wurde; andernfalls 'false' (oder [true, false, ...] für arrays)
        var add = function(item) {
            var itemAddAction = function(i) {
                if (getItem(i)) return false;

                items.push(i);
                return true;
            }

            if (Array.isArray(item)) {
                return item.map(itemAddAction);
            }

            return itemAddAction(item);
        }

        // gibt das entfernten elemente zurück. Sollte kein element entfernt werden, dann 'undefined' (oder [elem, 'undefined', ...] für arrays)
        var remove = function(item) {

            var itemRemoveAction = function(i) {
                var match = $.rki.utils.array.firstOrDefault(items, function(_i) {
                    return comparer(i, _i);
                });

                return match && items.splice(match.index, 1);
            }

            if (Array.isArray(item)) {
                return item.map(itemRemoveAction);
            }

            return itemRemoveAction(item);
        }

        return {
            items: items,
            add: add,
            remove: remove,
            getItem: getItem
        }
    }
})();