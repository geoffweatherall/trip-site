(function () {
  var D = window.TRIP_MAPS;
  if (!D || !window.L) return;

  function gmaps(p) { return 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng; }

  Object.keys(D).forEach(function (city) {
    var c = D[city], el = document.getElementById('map-' + city);
    if (!el) return;
    var map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.on('focus', function () { map.scrollWheelZoom.enable(); });
    map.on('blur', function () { map.scrollWheelZoom.disable(); });

    var legend = document.getElementById('legend-' + city);
    var markers = {}, all = [], central = [];

    c.places.forEach(function (p) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="pin ' + p.weather + '">' + p.n + '</div>',
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14]
      });
      var m = L.marker([p.lat, p.lng], { icon: icon, title: p.n + '. ' + p.name }).addTo(map);
      var box = document.createElement('div');
      var b = document.createElement('b');
      b.textContent = p.n + '. ' + p.name;
      var a = document.createElement('a');
      a.href = gmaps(p); a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open in Google Maps';
      box.appendChild(b); box.appendChild(document.createElement('br')); box.appendChild(a);
      m.bindPopup(box);
      markers[p.n] = m;
      all.push([p.lat, p.lng]);
      if (p.lat > 35.58 && p.lat < 35.74 && p.lng > 139.62 && p.lng < 139.82) central.push([p.lat, p.lng]);

      if (legend) {
        var li = document.createElement('li');
        li.value = p.n; li.tabIndex = 0; li.textContent = p.name;
        var go = function () { map.setView(m.getLatLng(), Math.max(map.getZoom(), 13)); m.openPopup(); el.scrollIntoView({ block: 'center' }); };
        li.addEventListener('click', go);
        li.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
        legend.appendChild(li);
      }
    });

    var tpLayer = L.layerGroup().addTo(map), letter = { subway: 'M', train: 'T', bus: 'B' };
    var tpList = document.createElement('ul');
    tpList.className = 'tplist';
    (c.transport || []).forEach(function (t) {
      var tm = L.marker([t.lat, t.lng], {
        icon: L.divIcon({ className: '', html: '<div class="tp ' + t.type + '">' + letter[t.type] + '</div>', iconSize: [22, 22], iconAnchor: [11, 11] }),
        title: t.name, zIndexOffset: -500
      }).bindTooltip(t.name, { permanent: true, direction: 'right', offset: [12, 0], className: 'tlabel' }).addTo(tpLayer);
      var li = document.createElement('li');
      li.className = t.type; li.tabIndex = 0;
      var badge = document.createElement('b'); badge.textContent = letter[t.type];
      li.appendChild(badge); li.appendChild(document.createTextNode(t.name));
      var goT = function () { map.setView([t.lat, t.lng], Math.max(map.getZoom(), 15)); el.scrollIntoView({ block: 'center' }); };
      li.addEventListener('click', goT);
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter') goT(); });
      tpList.appendChild(li);
    });
    if (c.transport && c.transport.length) {
      L.control.layers(null, { 'Stations and bus stops': tpLayer }, { collapsed: false, position: 'topright' }).addTo(map);
      var h = document.createElement('h4');
      h.textContent = 'Stations and bus stops';
      legend.parentNode.insertBefore(h, legend.nextSibling);
      legend.parentNode.insertBefore(tpList, h.nextSibling);
    }
    function labels() { el.classList.toggle('zl', map.getZoom() >= 14); }
    map.on('zoomend', labels);

    var s = c.stay;
    L.marker(s, {
      icon: L.divIcon({ className: '', html: '<div class="pin stay">★</div>', iconSize: [30, 30], iconAnchor: [15, 15] }),
      title: 'Where we are staying (approximate)', zIndexOffset: 1000
    }).addTo(map);
    all.push(s);
    if (central.length) central.push(s);

    function fit(pts) { map.fitBounds(pts, { padding: [30, 30] }); }
    fit(all);
    labels();

    if (central.length > 2 && central.length < all.length) {
      var bar = document.createElement('div');
      bar.className = 'mapviews';
      [['Whole region (day trips too)', all], ['Central Tokyo', central]].forEach(function (v) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = v[0];
        btn.addEventListener('click', function () { fit(v[1]); });
        bar.appendChild(btn);
      });
      el.parentNode.insertBefore(bar, el);
    }
  });
})();
