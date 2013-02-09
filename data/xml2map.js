#!/usr/bin/env node

var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js');

function convertXGML(el) {

    var data = {
        id: el.$.name,
        data: {}
    };

    var i, l;
    if (el.attribute) {
        for(i = 0, l = el.attribute.length; i < l; i++) {

            var attr = el.attribute[i],
                value = attr._,
                key = attr.$.key,
                type = attr.$.type;

            if (type === 'String') {
                value = '' + value;

            } else if (type === 'int' || type === 'double') {
                value = +value;
            }

            data.data[key] = value;

        }
    }

    if (el.section) {
        data.children = [];
        for(i = 0, l = el.section.length; i < l; i++) {
            data.children.push(convertXGML(el.section[i]));
        }
    }

    return data;

}

function toMap(data) {

    var playerMap = {
        '#999999': 'neutral',
        '#FF0000': 'red',
        '#3366FF': 'blue',
        '#FF9900': 'orange',
        '#99CC00': 'green'
    };

    var links = data.filter(function(el) {
        return el.id === 'edge';

    }).map(function(el) {
        return {
            from: el.data.source,
            to: el.data.target
        };
    });

    var nodes = data.filter(function(el) {
        return el.id === 'node';

    }).map(function(el) {

        var data = el.children[0].data,
            p = playerMap[data.fill] || data.fill;

        return {
            data: JSON.parse(el.data.label === 'undefined' ? '{}' : el.data.label),
            x: data.x,
            y: data.y
        };

    });

    return {
        nodes: nodes,
        links: links
    };

}


var args = process.argv.slice(2);

if (args.length < 2) {
    console.log('Usage: [xmlFile] [output]');

} else {

    var parser = new xml2js.Parser(),
        input = fs.readFileSync(args[0]);

    parser.parseString(input, function (err, result) {

        result = convertXGML(result.section.section[0]);
        result = toMap(result.children);

        fs.writeFileSync(args[1], JSON.stringify(result, null, 4));

    });

}

