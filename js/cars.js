/**
 * ============================================================
 * cars.js — CarX Cars Listing Page
 * Handles filtering, sorting, and rendering of vehicle cards
 * ============================================================
 */

$(document).ready(function () {

    // ============================================================
    // GLOBALS
    // ============================================================
    let allCars = [];
    let filteredCars = [];
    const VEHICLE_API = 'data/cars.json';

    // DOM refs
    const $resultsGrid = $('#resultsGrid');
    const $resultsCount = $('#resultsCount');
    const $sortSelect = $('#sortSelect');

    // Filter inputs
    const $filterMake = $('#filterMake');
    const $filterModel = $('#filterModel');
    const $filterPrice = $('#filterPrice');
    const $filterBody = $('#filterBody');
    const $filterFuel = $('#filterFuel');
    const $filterTrans = $('#filterTrans');
    const $filterMileage = $('#filterMileage');
    const $filterApply = $('#filterApply');
    const $filterReset = $('#filterReset');

    // ============================================================
    // LOAD VEHICLES
    // ============================================================
    function loadVehicles() {
        return $.ajax({
            url: VEHICLE_API,
            method: 'GET',
            dataType: 'json'
        });
    }

    // ============================================================
    // EXTRACT URL PARAMS (from hero search)
    // ============================================================
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            make: params.get('make') || '',
            model: params.get('model') || '',
            price: params.get('price') ? parseInt(params.get('price')) : null,
            filter: params.get('filter') || '' // for category links (hatchback, saloon, etc.)
        };
    }

    // ============================================================
    // POPULATE FILTER DROPDOWNS
    // ============================================================
    function populateFilterOptions(cars) {
        // Makes
        const makes = [...new Set(cars.map(c => c.make))].sort();
        $filterMake.empty().append('<option value="">Any Make</option>');
        makes.forEach(m => $filterMake.append(`<option value="${m}">${m}</option>`));

        // Models (will be updated on make change)
        updateModelOptions(cars, '');

        // Body types
        const bodies = [...new Set(cars.map(c => c.bodyType || 'Other'))].sort();
        $filterBody.empty().append('<option value="">Any Body</option>');
        bodies.forEach(b => $filterBody.append(`<option value="${b}">${b}</option>`));

        // Fuel
        const fuels = [...new Set(cars.map(c => c.fuel))].sort();
        $filterFuel.empty().append('<option value="">Any Fuel</option>');
        fuels.forEach(f => $filterFuel.append(`<option value="${f}">${f}</option>`));

        // Transmission
        const trans = [...new Set(cars.map(c => c.transmission))].sort();
        $filterTrans.empty().append('<option value="">Any Transmission</option>');
        trans.forEach(t => $filterTrans.append(`<option value="${t}">${t}</option>`));

        // Price (fixed options)
        // Keep as is.

        // Mileage (fixed options)
        // Keep as is.
    }

    // Update model dropdown based on selected make
    function updateModelOptions(cars, selectedMake) {
        let models = [];
        if (selectedMake) {
            models = [...new Set(cars.filter(c => c.make === selectedMake).map(c => c.model))].sort();
        } else {
            models = [...new Set(cars.map(c => c.model))].sort();
        }
        $filterModel.empty().append('<option value="">Any Model</option>');
        models.forEach(m => $filterModel.append(`<option value="${m}">${m}</option>`));
    }

    // ============================================================
    // FILTERING & SORTING
    // ============================================================
    function filterAndSortCars() {
        const make = $filterMake.val();
        const model = $filterModel.val();
        const priceMax = $filterPrice.val() ? parseInt($filterPrice.val()) : Infinity;
        const body = $filterBody.val();
        const fuel = $filterFuel.val();
        const trans = $filterTrans.val();
        const mileageMax = $filterMileage.val() ? parseInt($filterMileage.val()) : Infinity;
        const sort = $sortSelect.val();

        // Start with all cars
        let results = allCars.slice();

        // Apply filters
        if (make) results = results.filter(c => c.make === make);
        if (model) results = results.filter(c => c.model === model);
        if (priceMax !== Infinity) results = results.filter(c => c.price <= priceMax);
        if (body) results = results.filter(c => (c.bodyType || 'Other') === body);
        if (fuel) results = results.filter(c => c.fuel === fuel);
        if (trans) results = results.filter(c => c.transmission === trans);
        if (mileageMax !== Infinity) results = results.filter(c => c.mileage <= mileageMax);

        // Apply sorting
        switch (sort) {
            case 'newest':
                results.sort((a, b) => b.year - a.year);
                break;
            case 'price-low':
                results.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                results.sort((a, b) => b.price - a.price);
                break;
            case 'mileage':
                results.sort((a, b) => a.mileage - b.mileage);
                break;
            default:
                // default: by id or newest? We'll keep as is (original order)
                break;
        }

        filteredCars = results;
        renderResults(results);
        updateResultsCount(results.length);
    }

    // ============================================================
    // RENDER RESULTS
    // ============================================================
    function renderResults(cars) {
        if (!cars.length) {
            $resultsGrid.html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5>No vehicles found</h5>
                    <p class="text-muted">Try adjusting your filters or search criteria.</p>
                </div>
            `);
            return;
        }

        let html = '';
        cars.forEach(car => {
            const badgeHtml = car.badge ? `<span class="card-badge">${car.badge}</span>` : '';
            html += `
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
        });

        $resultsGrid.html(html);
    }

    function updateResultsCount(count) {
        $resultsCount.text(`${count} Vehicle${count !== 1 ? 's' : ''} Found`);
    }

    // ============================================================
    // APPLY URL PARAMS ON LOAD
    // ============================================================
    function applyUrlParams() {
        const params = getUrlParams();

        // Handle filter param from category links (e.g., ?filter=hatchback)
        if (params.filter) {
            // Map filter values to bodyType or other fields?
            // We'll treat filter as bodyType for simplicity, but also handle special cases like 'latest', 'under5000', etc.
            const filterVal = params.filter.toLowerCase();
            // Map to body type
            const bodyMap = {
                'hatchback': 'Hatchback',
                'saloon': 'Saloon',
                'estate': 'Estate',
                'suv': 'SUV',
                'mpv': 'MPV',
                'sports': 'Sports',
                '4x4': '4x4',
                'diesel': 'Diesel' // but diesel is fuel, not body. We'll handle separately.
            };

            // Also handle price filters
            const priceMap = {
                'under5000': 5000,
                'under10000': 10000
            };

            if (bodyMap[filterVal]) {
                $filterBody.val(bodyMap[filterVal]);
            } else if (filterVal === 'diesel') {
                $filterFuel.val('Diesel');
            } else if (filterVal === 'automatic') {
                $filterTrans.val('Automatic');
            } else if (filterVal === 'manual') {
                $filterTrans.val('Manual');
            } else if (filterVal === 'petrol') {
                $filterFuel.val('Petrol');
            } else if (filterVal === 'hybrid') {
                $filterFuel.val('Hybrid');
            } else if (filterVal === 'electric') {
                $filterFuel.val('Electric');
            } else if (filterVal === 'lowmileage') {
                $filterMileage.val(30000); // under 30k miles
            } else if (priceMap[filterVal]) {
                $filterPrice.val(priceMap[filterVal]);
            } else if (filterVal === 'family' || filterVal === 'first') {
                // not a direct filter, we'll skip
            }
            // else ignore
        }

        // Apply make/model from URL
        if (params.make) {
            $filterMake.val(params.make);
            // Trigger model update
            $filterMake.trigger('change');
        }
        if (params.model) {
            // Wait for model options to populate
            setTimeout(() => {
                $filterModel.val(params.model);
            }, 100);
        }
        if (params.price) {
            $filterPrice.val(params.price);
        }

        // Apply filters
        filterAndSortCars();
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================
    function init() {
        loadVehicles()
            .done(function (data) {
                allCars = data;
                filteredCars = data;

                // Populate filter dropdowns
                populateFilterOptions(allCars);

                // Apply URL params and render
                applyUrlParams();

                // Set up event listeners
                $filterMake.on('change', function () {
                    const selected = $(this).val();
                    updateModelOptions(allCars, selected);
                    filterAndSortCars();
                });

                $filterModel.on('change', filterAndSortCars);
                $filterPrice.on('change', filterAndSortCars);
                $filterBody.on('change', filterAndSortCars);
                $filterFuel.on('change', filterAndSortCars);
                $filterTrans.on('change', filterAndSortCars);
                $filterMileage.on('change', filterAndSortCars);
                $sortSelect.on('change', filterAndSortCars);

                $filterApply.on('click', function (e) {
                    e.preventDefault();
                    filterAndSortCars();
                });

                $filterReset.on('click', function (e) {
                    e.preventDefault();
                    // Reset all filters
                    $filterMake.val('');
                    $filterModel.val('');
                    $filterPrice.val('');
                    $filterBody.val('');
                    $filterFuel.val('');
                    $filterTrans.val('');
                    $filterMileage.val('');
                    $sortSelect.val('newest');
                    // Update model options based on all cars (make='')
                    updateModelOptions(allCars, '');
                    filterAndSortCars();
                });

                // Handle filter param from URL (already done in applyUrlParams)
            })
            .fail(function () {
                $resultsGrid.html('<div class="col-12 text-center py-5"><h5>Error loading vehicles</h5><p class="text-muted">Please try again later.</p></div>');
            });
    }

    init();

}); // end document ready