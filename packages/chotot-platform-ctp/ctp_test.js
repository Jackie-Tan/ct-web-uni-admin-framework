import ctp from './ctp';
Tinytest.add('test TS', test => {
    let aCtp = new ctp(function(){
        let { T, S, C } = this;
        return T({
            prefix:  'home/list',
            display: 'ads',
            icons: 'fa-money',
            roles: [101],
            schema: S([
                C({
                    key: 'c1',  
                    text: 'check c1',
                    input: {
                        type: 'text'
                    } // implement below
                }),
                C({
                    key: 'c2',  
                    text: 'check c2',
                    input: {
                        type: 'text'
                    } // implement below
                })
            ])
        });
    });
    test.isFalse(aCtp._error);
    test.equal(aCtp._config, {
        prefix:  'home/list',
        display: 'ads',
        icons: 'fa-money',
        roles: [101],
        schema: {
            c1: {
                key: 'c1',  
                text: 'check c1',
                input: {
                    type: 'text'
                } // implement below
            },
            c2: {
                key: 'c2',  
                text: 'check c2',
                input: {
                    type: 'text'
                } // implement below
            }
        }
    });
})