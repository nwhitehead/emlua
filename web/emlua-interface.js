var emlua = 
(function() {


return {
    init: Module.cwrap('init', 'number', null),
    exec: Module.cwrap('exec', null, ['number', 'string', 'string']),
    deinit: Module.cwrap('deinit', null, ['number'])
};

})();
