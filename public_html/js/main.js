$(function () {
  function createBox(center) {
    var box = $('<div class="card-box"></div>').appendTo('#cards');
    return box[0];
  }
  function createCard() {
    var container = $('#cards'),
        index = container.children().length - 1,
        card = $(cardTemplate).appendTo(container);
    card.find('img').attr('src', 'images/cards/card' + index + '.jpg');
    return card;
  }
  function createNextCard() {
    var thiscard = createCard(),
        radix = Math.random() / 2,
        angle = Math.random() * Math.PI * 2;
    cards.push(thiscard);
    TweenLite.to(thiscard, 0.4, {
      css: {
        left: viewport.width * Math.cos(angle) * radix + viewport.width / 2,
        top: viewport.height * Math.sin(angle) * radix + viewport.cY,
        rotation: Math.random() * 90 - 45,
        z: 1,
      },
      onStart: function () {
        $(this.target).toggleClass('card-ready card-back');
      },
    });
    
    if (cards.length < CARDS_NUM) {
      setTimeout(createNextCard, 33);
    } else {
      setTimeout(init, 500);
    }
  }
  function tidyNextCard(card) {
    var index = cards.indexOf(card);
    if ($.contains($('#fav-cards')[0], card)) {
      return;
    }
    var obj = {
      rotation: 0,
    };
    if (index < 2) {
      obj.scale = 1.3;
      obj.left = 365 + index * 156;
      obj.top = 115;
    } else if ((index - 2) % 13 < 2) {
      obj.left = 73 + ((index - 2) % 13 + (index / 13 >> 0) * 2) * 102 + (index / 13 > 2 ? 26 : 0);
      obj.top = 278;
    } else {
      obj.left = (index - 4 - ((index - 2) / 13 >> 0) * 2) % 11 * 74 + 73;
      obj.top = ((index - 4 - ((index - 2) / 13 >> 0) * 2) / 11 >> 0) * 60 + 420;
    }
    var animation = {
      css: obj
    };
    if (index < CARDS_NUM - 1) {
      animation.onComplete = tidyNextCard;
      animation.onCompleteParams = [cards[index + 1]];
    } else {
      animation.onComplete = tidyOver();
    }
    $('#cards').append(card);
    TweenLite.to(card, 0.2, animation);
  }
  function tidyOver() {
    $('#tidy-button a').removeClass('disabled');
  }
  function addCardToFav(card) {
    card
      .removeClass('card-ready')
      .appendTo($('#fav-cards'));
    TweenLite.to(card[0], 0.5, {
      css: {
        scale: 1,
        rotation: 0,
      }
    });
  }
  function init() {
    $('.card-ready').draggable({
      snap: '#fav-cards',
      snapMode: 'inter',
      drag: function (event, ui) {
        if (ui.helper.hitTestObject(garbage)) {
          garbage.addClass('active');
          return;
        }
        if (ui.helper.hitTestObject(favcards)) {
          favcards.addClass('active');
          return;
        }
        $('.active').removeClass('active');
      },
      start: function (event, ui) {
        ui.helper.addClass('top-card');
      },
      stop: function (event, ui) {
        ui.helper.removeClass('top-card');
        if (garbage.hasClass('active')) {
          ui.helper
            .draggable('destroy')
            .remove();
          garbage.removeClass('active');
          return;
        }
      
        if (favcards.hasClass('active')) {
          ui.helper
            .appendTo(favcards)
            .css({
              left: (favcards.children().length - 1) * 70,
              top: 24,
            });
          TweenLite.to(ui.helper[0], 0.3, {
            css: {
              scale: 1,
              rotation: 0,
            },
          });
          favcards.removeClass('active');
          return;
        }
      
        if (ui.helper.parent().is(favcards)) {
          var offset = favcards.offset();
          ui.helper.css({
            left: '+=30',
            top: '+=' + offset.top,
          });
        }
        $('#cards').append(ui.helper);
      }
    });
    $(document)
      .on('click', '.device-button', function (event) {
        $('#device-detail')
          .data('card', $(this).closest('.card'))
          .find('.modal-body').html($(this).children().first().clone());
      })
      .on('click', 'button[type=submit]', function (event) {
        var modal = $(this).closest('.modal'),
            card = modal.data('card');
        addCardToFav(card);
        modal.modal('hide');
      })
      .on('click', '#tidy-button a', function (event) {
        if ($(this).hasClass('disabled')) {
          return;
        }
        $(this).addClass('disabled');
        tidyNextCard(cards[0]);
      });
    $('#fama, #tidy-button').show();
    TweenLite.to(box, 0.5, {css: {top: -120, left: 60}});
    TweenLite.to($('#title')[0], 0.5, {css: {top: -12}, ease: Cubic.easeOut});
  }
  
  // 动画由此开始
  var cards = [],
      WIDTH = $(window).width(),
      HEIGHT = $(window).height(),
      viewport = createViewport(WIDTH, HEIGHT - 180);
      cardTemplate = $('#card-template').html(),
      box = createBox(viewport.cX),
      garbage = $('#garbage'),
      favcards = $('#fav-cards');
  
  $('#cards').height(viewport.height + 200);
  TweenLite.to(box, 0.5, {css: {top: -60, left: 120}, ease: Back.easeOut, onComplete: createNextCard, delay: 0.5});
});
var CARDS_NUM = 54;
function createViewport(w, h) {
  var viewport = {
    width: 860,
    height: 0,
    cX: 0,
    cY: 0,
  };
  viewport.height = (h < 1040 ? (h > 700 ? h : 700) : 1040) - 200;
  viewport.cX = viewport.width >> 1;
  viewport.cY = (viewport.height - 200 >> 1) + 200;
  return viewport;
}
$.fn.hitTestObject = function(obj){
    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();
     
    var compare = obj.offset();
    compare.right = compare.left + obj.outerWidth();
    compare.bottom = compare.top + obj.outerHeight();
             
    return (!(compare.right < bounds.left || compare.left > bounds.right || compare.bottom < bounds.top || compare.top > bounds.bottom));
     
}