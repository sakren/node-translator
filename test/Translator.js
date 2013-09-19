// Generated by CoffeeScript 1.6.3
(function() {
  var Cache, FileStorage, Translator, fs, path, should, translator, _path;

  should = require('should');

  path = require('path');

  fs = require('fs');

  Translator = require('../lib/Translator');

  FileStorage = require('cache-storage/Storage/FileStorage');

  Cache = require('cache-storage');

  _path = path.resolve('./data');

  translator = null;

  describe('Translator', function() {
    beforeEach(function() {
      translator = new Translator;
      translator.language = 'en';
      return translator.directory = _path;
    });
    afterEach(function() {
      return translator = null;
    });
    describe('#constructor()', function() {
      return it('should contain some plural forms', function() {
        return translator.plurals.should.not.be.eql({});
      });
    });
    describe('#normalizeTranslations()', function() {
      it('should return normalized object with dictionary', function() {
        return translator.normalizeTranslations({
          car: 'car',
          bus: ['bus']
        }).should.eql({
          car: ['car'],
          bus: ['bus']
        });
      });
      it('should return normalized translations without comments', function() {
        return translator.normalizeTranslations({
          one: ['# hello #', 'car', '# house #', 'something']
        }).should.be.eql({
          one: ['car', 'something']
        });
      });
      it('should return normalized translations for list with comments', function() {
        return translator.normalizeTranslations({
          one: [['first'], '# comment #', ['second', '# comment #'], ['third']]
        }).should.be.eql({
          one: [['first'], ['second'], ['third']]
        });
      });
      return it('should return normalized translations for list with new syntax', function() {
        return translator.normalizeTranslations({
          '-- list': ['first', 'second', 'third']
        }).should.be.eql({
          list: [['first'], ['second'], ['third']]
        });
      });
    });
    describe('#getMessageInfo()', function() {
      return it('should return information about dictionary from message to translate', function() {
        return translator.getMessageInfo('web.pages.homepage.promo.title').should.eql({
          path: 'web/pages/homepage',
          category: 'promo',
          name: 'title'
        });
      });
    });
    describe('#loadCategory()', function() {
      it('should load parsed dictionary', function() {
        return translator.loadCategory('web/pages/homepage', 'simple').should.eql({
          title: ['Title of promo box']
        });
      });
      return it('should return empty object if dictionary does not exists', function() {
        return translator.loadCategory('some/unknown', 'translation').should.eql({});
      });
    });
    describe('#findTranslation()', function() {
      it('should return english translations from dictionary', function() {
        return translator.findTranslation('web.pages.homepage.promo.title').should.eql(['Title of promo box']);
      });
      return it('should return null when translation does not exists', function() {
        return should.not.exist(translator.findTranslation('some.unknown.translation'));
      });
    });
    describe('#pluralize()', function() {
      return it('should return right version of translation(s) by count', function() {
        var cars, fruits;
        cars = ['1 car', '%count% cars'];
        translator.pluralize('car', cars, 1).should.be.equal('1 car');
        translator.pluralize('car', cars, 4).should.be.equal('%count% cars');
        fruits = [['1 apple', '%count% apples'], ['1 orange', '%count% oranges']];
        translator.pluralize('list', fruits, 1).should.eql(['1 apple', '1 orange']);
        return translator.pluralize('list', fruits, 4).should.eql(['%count% apples', '%count% oranges']);
      });
    });
    describe('#prepareTranslation()', function() {
      return it('should return expanded translation with arguments', function() {
        translator.addReplacement('item', 'car');
        translator.prepareTranslation('%item% has got %count% %append%.', {
          count: 5,
          append: 'things'
        }).should.be.equal('car has got 5 things.');
        return translator.removeReplacement('item');
      });
    });
    describe('#applyReplacements()', function() {
      return it('should add replacements to text', function() {
        return translator.applyReplacements('%one% %two% %three%', {
          one: 1,
          two: 2,
          three: 3
        }).should.be.equal('1 2 3');
      });
    });
    describe('#translate()', function() {
      it('should return translated text from dictionary', function() {
        return translator.translate('web.pages.homepage.promo.title').should.be.equal('Title of promo box');
      });
      it('should return original text if text is eclosed in \':\'', function() {
        return translator.translate(':do.not.translate.me:').should.be.equal('do.not.translate.me');
      });
      it('should return array of list', function() {
        return translator.translate('web.pages.homepage.promo.list').should.be.eql(['1st item', '2nd item', '3rd item', '4th item', '5th item']);
      });
      it('should return translation for plural form', function() {
        return translator.translate('web.pages.homepage.promo.cars', 3).should.be.equal('3 cars');
      });
      it('should return translation of list for plural form', function() {
        return translator.translate('web.pages.homepage.promo.fruits', 3).should.be.eql(['3 bananas', '3 citrons', '3 oranges']);
      });
      it('should return translation with replacement in message', function() {
        translator.addReplacement('one', 1);
        translator.addReplacement('dictionary', 'promo');
        return translator.translate('web.pages.homepage.%dictionary%.%name%', null, {
          two: 2,
          name: 'advanced'
        }).should.be.equal('1 2');
      });
      return it('should translate with parameters in place of count argument', function() {
        var t;
        t = translator.translate('web.pages.homepage.promo.advanced', {
          one: '1',
          two: 2
        });
        return t.should.be.equal('1 2');
      });
    });
    describe('#translatePairs()', function() {
      it('should throw an error if message to translate are not arrays', function() {
        return (function() {
          return translator.translatePairs('web.pages.homepage.promo', 'title', 'list');
        }).should["throw"]();
      });
      it('should throw an error if keys and values have not got the same length', function() {
        return (function() {
          return translator.translatePairs('web.pages.homepage.promo', 'list', 'keys');
        }).should["throw"]();
      });
      return it('should return object with keys and values translations', function() {
        return translator.translatePairs('web.pages.homepage.promo', 'keys', 'values').should.be.eql({
          '1st title': '1st text',
          '2nd title': '2nd text',
          '3rd title': '3rd text',
          '4th title': '4th text'
        });
      });
    });
    describe('#setCacheStorage()', function() {
      it('should throw an exception if storage is not the right type', function() {
        return (function() {
          return translator.setCacheStorage(new Array);
        }).should["throw"]();
      });
      return it('should create cache instance', function() {
        var cachePath;
        cachePath = path.resolve('./cache');
        translator.setCacheStorage(new FileStorage(cachePath));
        return translator.cache.should.be.an.instanceOf(Cache);
      });
    });
    return describe('Cache', function() {
      beforeEach(function() {
        var cachePath;
        cachePath = path.resolve('./cache');
        return translator.setCacheStorage(new FileStorage(cachePath));
      });
      afterEach(function() {
        var cachePath, dicPath;
        cachePath = path.resolve('./cache/__translator.json');
        dicPath = path.resolve('./data/web/pages/homepage/en.cached.json');
        if (fs.existsSync(cachePath)) {
          fs.unlinkSync(cachePath);
        }
        return fs.writeFileSync(dicPath, '{"# version #": 1, "variable": "1"}');
      });
      return describe('#translate()', function() {
        it('should load translation from cache', function() {
          translator.translate('web.pages.homepage.promo.title');
          return translator.cache.load('en:web/pages/homepage/promo').should.be.a('object').and.have.property('title');
        });
        it('should invalidate cache for dictionary after it is changed', function() {
          var data, dictionary;
          dictionary = path.resolve('./data/web/pages/homepage/en.simple.json');
          data = fs.readFileSync(dictionary, {
            encoding: 'utf-8'
          });
          translator.translate('web.pages.homepage.simple.title');
          fs.writeFileSync(dictionary, data);
          translator.cache.invalidate();
          return should.not.exists(translator.cache.load('en:web/pages/homepage/simple'));
        });
        it('should load data from dictionary with version', function() {
          return translator.translate('web.pages.homepage.cached.variable').should.be.equal('1');
        });
        it('should change data in dictionary with version, but load the old one', function() {
          var dicPath;
          translator.translate('web.pages.homepage.cached.variable').should.be.equal('1');
          dicPath = path.resolve('./data/web/pages/homepage/en.cached.json');
          fs.writeFileSync(dicPath, '{"# version #": 1, "variable": "2"}');
          translator.invalidate();
          return translator.translate('web.pages.homepage.cached.variable').should.be.equal('1');
        });
        return it('should change data in dictionary with version and load it', function() {
          var dicPath, name;
          translator.translate('web.pages.homepage.cached.variable').should.be.equal('1');
          dicPath = path.resolve('./data/web/pages/homepage/en.cached.json');
          fs.writeFileSync(dicPath, '{"# version #": 2, "variable": "2"}');
          translator.invalidate();
          name = require.resolve('./data/web/pages/homepage/en.cached');
          delete require.cache[name];
          return translator.translate('web.pages.homepage.cached.variable').should.be.equal('2');
        });
      });
    });
  });

}).call(this);
