const {each, dom} = require('../util');
const server = require('../server');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');

const settings = Object.assign({
    enabled: false,
    type: 'php-tar',
    packageName: 'package',
    alwaysVisible: false
}, allsettings.download);
const tpl =
        `<div id="download" class="tool">
            <a href="#" title="Download file or directory (as archive)" download>
                <img src="${resource.image('download')}" alt="download"/>
            </a>
        </div>`;
let selectedItems = [];
let $download;


const onSelection = items => {
    selectedItems = items.slice(0);
    if (selectedItems.length) {

        const type = settings.type;
        let name = settings.packageName;
        const extension = type === 'shell-zip' ? 'zip' : 'tar';


        if (!name) {
            if (selectedItems.length === 1) {
                name = selectedItems[0].label;
            } else {
                name = location.getItem().label;
            }
        }
        let filename = name+'.'+extension;


        // Add download link on href
        let link = '?action=download&as=' + filename;
        link += '&type='+encodeURIComponent(type);
        link += '&baseHref='+encodeURIComponent(location.getAbsHref());


        each(selectedItems, (item, idx) => {
            link += '&' + encodeURIComponent('hrefs['+ idx+ ']') + '=' + encodeURIComponent(item.absHref);
        });

        $download.children()[0].href=link;
        $download.children()[0].download=filename;
        $download.show();
    } else if (!settings.alwaysVisible) {
        $download.hide();
    }
};

const onClick = (e) => {

    e.preventDefault();
    const type = settings.type;
    let name = settings.packageName;
    const extension = type === 'shell-zip' ? 'zip' : 'tar';

    if (!name) {
        if (selectedItems.length === 1) {
            name = selectedItems[0].label;
        } else {
            name = location.getItem().label;
        }
    }

    const query = {
        action: 'download',
        as: name + '.' + extension,
        type,
        baseHref: location.getAbsHref(),
        hrefs: ''
    };

    each(selectedItems, (item, idx) => {
        query[`hrefs[${idx}]`] = item.absHref;
    });

    server.formRequest(query);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    $download = dom(tpl)
        .hide()
        .appTo('#toolbar')
        .on('click', onClick);

    if (settings.alwaysVisible) {
        $download.show();
    }

    event.sub('selection', onSelection);
};


init();
