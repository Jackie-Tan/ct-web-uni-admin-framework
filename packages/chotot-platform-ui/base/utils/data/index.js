module.exports = {
    getId(item) {
        let config = BaseTemplate.of()._config;
        let col_id = config.col_id;
        if (typeof col_id == 'string')
          return item[col_id];
        if (col_id && col_id.length)
          return col_id.map((col) => {
            return item[col];
          }).join(config.col_id_sep || '/');
        return item.id;
    }
}