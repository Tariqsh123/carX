/**
 * ============================================================
 * filters.js — CarX Generic Filtering & Sorting Module
 * Reusable utilities for vehicle listing pages
 * Dependencies: jQuery
 * ============================================================
 */

(function (global) {
    'use strict';

    // ---------- Private state ----------
    let _data = [];                 // full dataset
    let _filtered = [];            // current filtered results
    let _config = {};             // configuration object

    // ---------- Default configuration ----------
    const DEFAULTS = {
        container: '#resultsGrid',
        countEl: '#resultsCount',
        sortEl: '#sortSelect',
        filterMappings: {
            make: '#filterMake',
            model: '#filterModel',
            price: '#filterPrice',
            body: '#filterBody',
            fuel: '#filterFuel',
            trans: '#filterTrans',
            mileage: '#filterMileage'
        },
        sortOptions: {
            newest: (a, b) => b.year - a.year,
            'price-low': (a, b) => a.price - b.price,
            'price-high': (a, b) => b.price - a.price,
            mileage: (a, b) => a.mileage - b.mileage
        },
        defaultSort: 'newest',
        renderItem: null,          // function(car) => HTML string
        onFilter: null             // callback after filtering
    };

    // ---------- Utility: get filter values ----------
    function getFilterValues() {
        const map = _config.filterMappings;
        const values = {};
        for (const key in map) {
            const $el = $(map[key]);
            if ($el.length) {
                const val = $el.val();
                values[key] = (val && val !== '') ? val : null;
            } else {
                values[key] = null;
            }
        }
        // Convert price and mileage to numbers
        if (values.price) values.price = parseInt(values.price);
        if (values.mileage) values.mileage = parseInt(values.mileage);
        return values;
    }

    // ---------- Core filter function ----------
    function applyFilters() {
        const filters = getFilterValues();
        let results = _data.slice();

        // Make
        if (filters.make) {
            results = results.filter(c => c.make === filters.make);
        }
        // Model
        if (filters.model) {
            results = results.filter(c => c.model === filters.model);
        }
        // Price max
        if (filters.price) {
            results = results.filter(c => c.price <= filters.price);
        }
        // Body
        if (filters.body) {
            results = results.filter(c => (c.bodyType || 'Other') === filters.body);
        }
        // Fuel
        if (filters.fuel) {
            results = results.filter(c => c.fuel === filters.fuel);
        }
        // Transmission
        if (filters.trans) {
            results = results.filter(c => c.transmission === filters.trans);
        }
        // Mileage max
        if (filters.mileage) {
            results = results.filter(c => c.mileage <= filters.mileage);
        }

        _filtered = results;
        return results;
    }

    // ---------- Sort ----------
    function applySort(data) {
        const sortKey = $(_config.sortEl).val() || _config.defaultSort;
        const sorter = _config.sortOptions[sortKey] || _config.sortOptions[_config.defaultSort];
        return data.slice().sort(sorter);
    }

    // ---------- Render ----------
    function renderResults(data) {
        const $container = $(_config.container);
        if (!$container.length) return;

        if (!data || data.length === 0) {
            $container.html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5>No vehicles found</h5>
                    <p class="text-muted">Try adjusting your filters or search criteria.</p>
                </div>
            `);
            return;
        }

        let html = '';
        const renderFn = _config.renderItem || defaultRenderItem;
        data.forEach(car => {
            html += renderFn(car);
        });
        $container.html(html);
    }

    // ---------- Default item renderer (matching vehicle-card) ----------
    function defaultRenderItem(car) {
        const badgeHtml = car.badge ? `<span class="card-badge">${car.badge}</span>` : '';
        return `
            <div class="col-lg-4 col-md-6">
                <div class="vehicle-card">
                    <div class="card-img-wrap">
                        <img src="${car.image || 'images/cars/placeholder.jpg'}" alt="${car.make} ${car.model}" loading="lazy" />
                        ${badgeHtml}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${car.make} ${car.model}</h5>
                        <div class="card-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${car.year}</span>
                            <span><i class="fas fa-tachometer-alt"></i> ${car.mileage.toLocaleString()} miles</span>
                            <span><i class="fas fa-gas-pump"></i> ${car.fuel}</span>
                            <span><i class="fas fa-cog"></i> ${car.transmission}</span>
                        </div>
                        <div class="card-price">£${car.price.toLocaleString()}</div>
                        <p class="card-desc">${car.description || ''}</p>
                        <div class="card-actions">
                            <a href="car-details.html?id=${car.id}" class="btn btn-maroon btn-sm">VIEW DETAILS</a>
                            <a href="contact.html" class="btn btn-outline-dark btn-sm">ENQUIRE</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ---------- Update count ----------
    function updateCount(count) {
        const $el = $(_config.countEl);
        if ($el.length) {
            $el.text(`${count} Vehicle${count !== 1 ? 's' : ''} Found`);
        }
    }

    // ---------- Main filter + render pipeline ----------
    function filterAndRender() {
        const filtered = applyFilters();
        const sorted = applySort(filtered);
        renderResults(sorted);
        updateCount(sorted.length);
        if (typeof _config.onFilter === 'function') {
            _config.onFilter(sorted);
        }
        return sorted;
    }

    // ---------- Populate dropdowns ----------
    function populateDropdowns(data) {
        const map = _config.filterMappings;

        // Make
        const $make = $(map.make);
        if ($make.length) {
            const makes = [...new Set(data.map(c => c.make))].sort();
            $make.empty().append('<option value="">Any Make</option>');
            makes.forEach(m => $make.append(`<option value="${m}">${m}</option>`));
        }

        // Model (initially all models)
        const $model = $(map.model);
        if ($model.length) {
            const models = [...new Set(data.map(c => c.model))].sort();
            $model.empty().append('<option value="">Any Model</option>');
            models.forEach(m => $model.append(`<option value="${m}">${m}</option>`));
        }

        // Body
        const $body = $(map.body);
        if ($body.length) {
            const bodies = [...new Set(data.map(c => c.bodyType || 'Other'))].sort();
            $body.empty().append('<option value="">Any Body</option>');
            bodies.forEach(b => $body.append(`<option value="${b}">${b}</option>`));
        }

        // Fuel
        const $fuel = $(map.fuel);
        if ($fuel.length) {
            const fuels = [...new Set(data.map(c => c.fuel))].sort();
            $fuel.empty().append('<option value="">Any Fuel</option>');
            fuels.forEach(f => $fuel.append(`<option value="${f}">${f}</option>`));
        }

        // Transmission
        const $trans = $(map.trans);
        if ($trans.length) {
            const trans = [...new Set(data.map(c => c.transmission))].sort();
            $trans.empty().append('<option value="">Any Transmission</option>');
            trans.forEach(t => $trans.append(`<option value="${t}">${t}</option>`));
        }

        // Price and Mileage dropdowns are static, no need to populate.
    }

    // ---------- Update model dropdown based on make selection ----------
    function updateModelsForMake(make) {
        const $model = $(_config.filterMappings.model);
        if (!$model.length) return;

        let models = [];
        if (make) {
            models = [...new Set(_data.filter(c => c.make === make).map(c => c.model))].sort();
        } else {
            models = [...new Set(_data.map(c => c.model))].sort();
        }
        $model.empty().append('<option value="">Any Model</option>');
        models.forEach(m => $model.append(`<option value="${m}">${m}</option>`));
        // If there was a previously selected model that is still valid, we could preserve it,
        // but we'll let the user re-select.
    }

    // ---------- Public API ----------
    const CarXFilters = {

        /**
         * Initialize the filter module.
         * @param {Object} config
         * @param {Array} config.data - array of vehicle objects
         * @param {string} config.container - selector for results grid
         * @param {string} config.countEl - selector for count display
         * @param {string} config.sortEl - selector for sort dropdown
         * @param {Object} config.filterMappings - mapping of filter keys to selectors
         * @param {Object} config.sortOptions - custom sort functions (optional)
         * @param {string} config.defaultSort - default sort key
         * @param {Function} config.renderItem - custom render function
         * @param {Function} config.onFilter - callback after filtering
         */
        init: function (config) {
            _config = $.extend(true, {}, DEFAULTS, config);
            _data = config.data || [];
            _filtered = _data.slice();

            // Populate dropdowns
            populateDropdowns(_data);

            // Bind events
            const map = _config.filterMappings;
            // Make change updates models
            const $make = $(map.make);
            if ($make.length) {
                $make.on('change', function () {
                    const val = $(this).val() || '';
                    updateModelsForMake(val);
                    filterAndRender();
                });
            }

            // Other filters trigger filter on change
            const filterSelectors = [map.model, map.price, map.body, map.fuel, map.trans, map.mileage]
                .filter(s => s && s.length > 0)
                .join(',');
            $(filterSelectors).on('change', filterAndRender);

            // Sort dropdown
            const $sort = $(_config.sortEl);
            if ($sort.length) {
                $sort.on('change', filterAndRender);
            }

            // Apply button (if present)
            const $apply = $('#filterApply');
            if ($apply.length) {
                $apply.on('click', function (e) {
                    e.preventDefault();
                    filterAndRender();
                });
            }

            // Reset button (if present)
            const $reset = $('#filterReset');
            if ($reset.length) {
                $reset.on('click', function (e) {
                    e.preventDefault();
                    // Reset all filter selects to empty
                    for (const key in map) {
                        const $el = $(map[key]);
                        if ($el.length && $el.is('select')) {
                            $el.val('');
                        }
                    }
                    // Also reset sort to default
                    if ($sort.length) {
                        $sort.val(_config.defaultSort);
                    }
                    // Update models based on no make
                    updateModelsForMake('');
                    filterAndRender();
                });
            }

            // Initial render
            filterAndRender();

            // Return the instance for chaining
            return this;
        },

        /**
         * Manually trigger filter and render (useful after data update)
         */
        refresh: function () {
            filterAndRender();
            return this;
        },

        /**
         * Get the current filtered data
         */
        getFiltered: function () {
            return _filtered;
        },

        /**
         * Get the full dataset
         */
        getData: function () {
            return _data;
        },

        /**
         * Update the data set and re-initialize
         */
        setData: function (newData) {
            _data = newData;
            _filtered = _data.slice();
            populateDropdowns(_data);
            updateModelsForMake($(_config.filterMappings.make).val() || '');
            filterAndRender();
            return this;
        }
    };

    // Expose globally
    global.CarXFilters = CarXFilters;

})(window);