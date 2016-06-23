angular.module('ImageBrickWall').directive('brickWall', function(configService, $compile) {
	return {
		restrict: 'E',
		scope: {
			bricks : '=',
		},
		compile: function(element, attr) {
			var brickHtml = element.html();

			return function (scope, element, attrs, fn) {
	      var lastWidth = 0;
	      var rowWidth = 0;
	      var maxByRow = parseInt(attrs['maxByRow']) || 4;
	      var margin = parseInt(attrs['margin']) || 5;
	      var rowHeight = parseInt(attrs['rowHeight']) || 200;
				var item = attrs['item'] || 'item';
	      scope.rows = [];
				scope.$watch('bricks', function(nv, ov) {
					if (nv) {
	            refresh();
					}
				});

				var refresh = function(){
						rowWidth = element.parent().width();
						if (!rowWidth) {
							throw new Error('brick-wall: unable to get parentWidth');
							return;
						}
						if (rowWidth !== lastWidth) {
							buildWall(scope.bricks);
							lastWidth = rowWidth;
						};
				};

				window.onresize = function() {
						refresh();
						scope.$apply();
				};

	      var Row = function(width, height, margin, maxByRow) {
	        this.bricks = [];
	        this.partialWidth = 0;
	        this.margin = margin || 10;
	        this.width = width - this.margin;
	        this.height = height;
	        this.maxByRow = maxByRow || 4;
					this.elem = angular.element('<div style="overflow:hidden; height:'+this.height+'px; margin-top: '+this.margin+'px; "></div>');
	      };

	      Row.prototype.addBrick = function(brick) {
	        this.partialWidth = this.partialWidth + this.margin + brick.width;
	        this.bricks.push(brick);
	      };

				Row.prototype.getGap = function() {
					return this.width - this.partialWidth;
	      };

	      Row.prototype.fit = function(brick) {
	        if (!this.bricks.length) {
						this.needResize = false;
	          return true;
	        }
	        if (this.bricks.length == this.maxByRow) {
						this.needResize = true;
	          return false;
	        }
	        if ((this.partialWidth + this.margin + brick.width) <= (this.width)) {
						this.needResize = false;
						return true;
					}
					else {
						if ((brick.width / 2) <= this.getGap()) {
							this.needResize = true;
							return true;
						}
						else {
							this.needResize = true;
							return false;
						}
					}
	      }

	      Row.prototype.resize = function(last) {
	        var remainingWidth = this.getGap();
					if (!this.needResize && last) {
						remainingWidth = 0;
					}
					var widthAdded = Math.floor(remainingWidth / (this.bricks.length ));
	        for (var i = 0; i < this.bricks.length ; i++) {
	            var brick = this.bricks[i];
	            brick.leftMargin = this.margin < 0 ? 0 : this.margin;
							var ratio = widthAdded / brick.width;
							var brickContainerWidth = brick.width + widthAdded;
							brick.widthAdded = widthAdded;
							brick.ratio = ratio;
							brick.container = {
								width: brickContainerWidth,
								height: this.height
							};
							if (widthAdded > 0) {
								brick.width = brickContainerWidth;
								brick.height = Math.floor(brick.height * (1+ratio));
							}
							var brickContainerElem = angular.element('<div style="overflow: hidden; float:left; position:relative; height:'+this.height+'px; width: '+brickContainerWidth+'px; margin-left: '+brick.leftMargin+'px;"></div>');
							var newScope = scope.$new(true);
						  newScope[item] = brick;
						  brickContainerElem.append($compile(brickHtml)(newScope));
							this.elem.append(brickContainerElem);
	        }
	      }

				var initBrick = function(brick, max_height) {
					brick.width = brick.width || 200;
					brick.height = brick.height || 200;
					brick.originalWidth = brick.originalWidth || brick.width;
					brick.originalHeight = brick.originalHeight || brick.height;
	        brick.width = Math.floor(brick.originalWidth / (brick.originalHeight / max_height));
					brick.height = max_height;
	      };

	      var buildWall = function(bricks, maxByRow) {
	        var rows = scope.rows;
	        rows.length = 0;
					element.empty();
	        var currentRow = 0;
	        rows.push(new Row(rowWidth, rowHeight, margin, maxByRow));

	        bricks.forEach(function(brick) {
						initBrick(brick, rowHeight);
	          if (rows[currentRow].fit(brick)) {
	              rows[currentRow].addBrick(brick);
	          }
	          else {
	            rows[currentRow].resize();
	            currentRow++;
	            rows.push(new Row(rowWidth, rowHeight, margin, maxByRow));
	            rows[currentRow].addBrick(brick);
	          }
	        });
	        rows[currentRow].resize(true);
					rows.forEach(function(row) {
						element.append(row.elem);
					});
					element.append('<div style="height: '+ margin*2 +'px;"><div>');
	      };
		  }
		}
	};
});
