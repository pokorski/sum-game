var validate_answer = function(prepared_question){
  var sum = 0;
  $('.option_button').each(function(){
    if ($(this).attr('clicked') == "1") sum += parseInt($(this).html());
  });
  return sum == prepared_question['target'];
};

var validate_question = function(prepared_question){
  var max_bitmask = 1 << (prepared_question['options'].length);
  var correct_answers_count = 0;
  for (var bm = 0; bm < max_bitmask; bm++) {
    var options_sum = 0;
    for (var i = 0; i < prepared_question['options'].length; i++)
      if (bm & (1 << i))
        options_sum += prepared_question['options'][i];
    if (options_sum == prepared_question['target'])
      correct_answers_count++;
  }
  return correct_answers_count == 1;
}

var prepare_question = function(difficulty){
  var parameters = [
    [4, 2, 2, 1, 5, 1, 10],
    [4, 2, 2, 2, 8, 5, 20],
    [4, 2, 3, 1, 10, 5, 30],
    [5, 2, 4, 5, 15, 10, 30],
    [6, 2, 4, 10, 20, 40, 60],
    [6, 2, 6, 10, 30, 40, 100]
  ];
  var options_count = parameters[difficulty][0];
  var min_correct_count = parameters[difficulty][1];
  var max_correct_count = parameters[difficulty][2];
  var min_option_value = parameters[difficulty][3];
  var max_option_value = parameters[difficulty][4];
  var min_target_value = parameters[difficulty][5];
  var max_target_value = parameters[difficulty][6];

  while (true) {
    var options = [];
    for (var i = 0; i < options_count; i++)
      options.push(Math.floor(Math.random() * (max_option_value - min_option_value + 1)) + min_option_value);

    var correct_options_count = Math.floor(Math.random() * (max_correct_count - min_correct_count + 1)) + min_correct_count;
    var correct_options = [];
    var target_sum = 0;
    for (var i = 0; i < correct_options_count; i++) {
      while (true) {
        var correct_option = Math.floor(Math.random() * options_count);
        if (correct_options.includes(correct_option)) continue;
        correct_options.push(correct_option);
        target_sum += options[correct_option];
        break;
      }
    }
    if (target_sum < min_target_value) continue;
    if (target_sum > max_target_value) continue;

    var prepared_question = {
      'target': target_sum,
      'options': options
    };
    if (validate_question(prepared_question)) return prepared_question;
  }
};

var prepare_image_pane = function(pane, count) {
  var images = [
    /*
    [  2, 'tree.png' ],
    [  4, 'sun.png' ],
    [  7, 'heart.png' ],
    [ 10, 'star.png' ],
    [ 15, 'happy.png' ],
    [ 20, 'flower.png' ],
    [ 25, 'baloon.png' ],
    [ 30, 'cloud.png' ],
    [ 40, 'plus_minus.png' ],
    [ 50, 'house.png' ],
    [ 60, 'fish.png' ],
    [ 70, 'cube.png' ],
    [ 80, 'cherries.png' ],
    [ 90, 'snail.png' ],
    [100, '100.png' ]
    */

    [  1, 'tree.png' ],
    [  2, 'sun.png' ],
    [  3, 'heart.png' ],
    [  4, 'star.png' ],
    [  5, 'happy.png' ],
    [  6, 'flower.png' ],
    [  7, 'baloon.png' ],
    [  8, 'cloud.png' ],
    [  9, 'plus_minus.png' ],
    [ 10, 'house.png' ],
    [ 11, 'fish.png' ],
    [ 12, 'cube.png' ],
    [ 13, 'cherries.png' ],
    [ 14, 'snail.png' ],
    [ 16, '100.png' ]

  ]

  pane.html('');

  if ((count > images[images.length - 1][0]) && (count % 2 == 1)) return;

  for (var i = 0; i < images.length; i++)
    if ((count >= images[i][0]) && ((i == images.length - 1) || (count < images[i + 1][0]))) {
      var image = $('<img>', { 'src': 'images/' + images[i][1] });
      pane.append(image);
      break;
    }
};

var question = function(result_pane, image_pane, pane, difficulty, count_correct, count_asked, answer_history) {
  var prepared_question = prepare_question(difficulty);

  result_pane.html($('<div>', { 'html': count_correct + ' / ' + count_asked }));
  var boxes_pane = $('<div>');
  result_pane.append(boxes_pane);
  for (var i = 0; i < answer_history.length; i++) {
    boxes_pane.append($('<span>', {
      'class': answer_history[i] == 'y' ? 'box_correct' : 'box_incorrect',
      'html': '&nbsp;&nbsp;&nbsp;'
    }));
  }

  prepare_image_pane(image_pane, count_correct);

  pane.html('');

  var target_pane = $('<div>', {
    'class': 'target_pane',
    'html': prepared_question['target']
  });
  pane.append(target_pane);

  pane.append($('<div>'))

  for (var i = 0; i < prepared_question['options'].length; i++) {
    var option_button = $('<button>', {
      'class': 'option_button',
      'html': prepared_question['options'][i],
      'clicked': 0
    });
    option_button.click(function(){
      if ($('.target_pane').hasClass('correct_answer')) return;
      if ($('.target_pane').hasClass('incorrect_answer')) return;

      $(this).attr('clicked', $(this).attr('clicked') ^ true);
    });
    pane.append(option_button);
  }
  var ok_button = $('<button>', {
    'class': 'ok_button',
    'html': 'OK',
    'tried': 0
  });
  ok_button.click(function(){
    if ($('.target_pane').hasClass('correct_answer')) return;
    if ($('.target_pane').hasClass('incorrect_answer')) return;

    var correct = validate_answer(prepared_question);

    if (correct) {
      $('.target_pane').addClass('correct_answer');
      $('.option_button[clicked="1"]').addClass('correct_answer');
      answer_history.push('y');
      var audio = new Audio('sounds/ding.mp3');
      audio.play();
      setTimeout(function(){
        question(result_pane, image_pane, pane, difficulty, count_correct + 1, count_asked + 1, answer_history);
      }, 2000);
    }
    else {
      $('.ok_button').attr('tried', parseInt($('.ok_button').attr('tried')) + 1);
      $('.target_pane').addClass('incorrect_answer');
      $('.option_button[clicked="1"]').addClass('incorrect_answer');
      var audio = new Audio('sounds/boom.mp3');
      audio.play();

      if ($('.ok_button').attr('tried') < 2) {
        setTimeout(function(){
          $('.target_pane').removeClass('incorrect_answer');
          $('.option_button[clicked="1"]').removeClass('incorrect_answer');
          $('.option_button').attr('clicked', 0);
        }, 2000);
      }
      else {
        answer_history.push('n');
        setTimeout(function(){
          question(result_pane, image_pane, pane, difficulty, count_correct, count_asked + 1, answer_history);
        }, 2000);
      }
    }
  });
  pane.append(ok_button);
}

var game = function(difficulty){
  var page_body = $('body');
  page_body.html('');

  var game_pane = $('<div>', {
    'class': 'game_pane'
  });
  page_body.append(game_pane);

  var game_menu_pane = $('<div>', {
    'class': 'game_menu_pane'
  });
  game_pane.append(game_menu_pane);

  var game_result_pane = $('<div>', {
    'class': 'game_result_pane'
  });
  game_menu_pane.append(game_result_pane);

  var game_image_pane = $('<div>', {
    'class': 'game_image_pane'
  });
  game_menu_pane.append(game_image_pane);

  var game_menu_buttons = $('<div>', {
    'class': 'game_menu_buttons'
  });
  game_menu_pane.append(game_menu_buttons);

  var go_back_button = $('<button>', {
    'class': 'go_back_button',
    'html': '<p>zmień poziom trudności</p><p>change difficulty level</p>'
  });
  go_back_button.click(function(){
    menu();
  });
  game_menu_buttons.append(go_back_button);

  var question_pane = $('<div>', {
    'class': 'question_pane'
  });
  game_pane.append(question_pane);

  question(game_result_pane, game_image_pane, question_pane, difficulty, 0, 0, []);
};

var menu = function(){
  var page_body = $('body');
  page_body.html('');

  var menu_pane = $('<div>', {
    'class': 'menu_pane'
  });
  page_body.append(menu_pane);

  var menu_text = $('<div>', {
    'class': 'menu_text',
    'html': '<p>wybierz poziom trudności</p><p>choose difficulty level</p>'
  });
  menu_pane.append(menu_text);

  var menu_buttons = $('<div>', {
    'class': 'menu_buttons'
  });
  menu_pane.append(menu_buttons);

  var option_texts = [
    '<p>przedszkole</p><p>kindergarten</p>',
    '<p>bardzo łatwy</p><p>very easy</p>',
    '<p>łatwy</p><p>easy</p>',
    '<p>średni</p><p>medium</p>',
    '<p>trudny</p><p>hard</p>',
    '<p>bardzo trudny</p><p>very hard</p>'
  ];
  for (var i = 0; i < 6; i++) {
    var menu_button = $('<button>', {
      'class': 'menu_button',
      'html': option_texts[i],
      'difficulty': i,
    });
    menu_button.click(function(){
      game(parseInt($(this).attr('difficulty')));
    });
    menu_buttons.append(menu_button);
  }

  var instruction_pane = $('<div>', {
    'class': 'instruction_pane',
    'html': '<p>Gra polega na wybraniu liczb, które sumują się do podanej w czarnym prostokącie.</p>' +
            '<p>The goal of the game is to choose numbers that sum up to the given target shown in the black rectangle.</p>'
  });
  menu_pane.append(instruction_pane);
};

$(document).ready(function(){
  menu();
});
