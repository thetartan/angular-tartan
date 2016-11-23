'use strict';

var _ = require('lodash');
var tartan = require('tartan');
var ngTartan = require('../../module');

ngTartan.directive('tartanPreviewImage', [
  function() {
    return {
      restrict: 'E',
      require: '^^tartan',
      template: '<canvas class="tartan-preview-image"></canvas>',
      replace: true,
      scope: {
        weave: '=?',
        metrics: '=?',
        zoom: '=?',
        renderer: '=?'
      },
      link: function($scope, element, attr, controller) {
        var canvas = element.find('canvas').get(0);
        var render = null;
        var currentState = null;

        var repaint = tartan.utils.repaint(function() {
          render(canvas, {x: 0, y: 0}, true);
        });

        function update() {
          var options = {
            zoom: $scope.zoom,
            weave: $scope.weave,
            defaultColors: currentState.colors,
            transformSyntaxTree: tartan.transform.flatten()
          };
          var renderer = tartan.render[$scope.renderer];
          if (!_.isFunction(renderer)) {
            renderer = _.find(tartan.render, {
              id: $scope.renderer
            });
            if (!_.isFunction(renderer)) {
              renderer = tartan.render.canvas;
            }
          }

          render = renderer(currentState.sett, options);
          $scope.metrics = render.metrics;
          updateCanvasSize();
        }

        function tartanChanged(state) {
          currentState = state;
          update();
          $scope.$applyAsync();
        }

        controller.on('tartan.changed', tartanChanged);

        controller.requestUpdate(tartanChanged);

        _.each(['weave', 'zoom', 'renderer'], function(name) {
          $scope.$watch(name, function(newValue, oldValue) {
            if (newValue !== oldValue) {
              update();
            }
          }, true);
        });

        function updateCanvasSize() {
          var w = Math.ceil(canvas.offsetWidth);
          var h = Math.ceil(canvas.offsetHeight);
          if (canvas.width != w) {
            canvas.width = w;
          }
          if (canvas.height != h) {
            canvas.height = h;
          }
          repaint();
        }

        $scope.$on('$destroy', function() {
          controller.off('tartan.changed', tartanChanged);
        });
      }
    };
  }
]);
