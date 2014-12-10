'use strict';
Application.Directives.directive('bounty',function() {
    return {
        restrict: 'E',
        templateUrl: 'app/bounty/bounty.html',
        replace: true,
        scope: {},
        controller: function($rootScope,$scope,Bounty,Global,ControlButtons) {
            $scope.control = ControlButtons.addControl('addBounty','Add Bounty',false,false);
            $scope.bounty = Bounty.init();
            $rootScope.$on('newSelection',function() {
                $scope.bounty = Bounty.init();
            });
            
            $rootScope.$on('newVideo',function() {
                Bounty.awardBounty();
            });
            
            $scope.addBounty = function() {
                Bounty.addBounty();
                $scope.control.show = false;
            };
            $scope.getKudos = Global.getKudos;
            $scope.getDJ = Global.getDJ;
        },
        link: function(scope,element,attrs) {
            
        }
    }
});

Application.Services.factory('Bounty',function(Videos,Global,FireService,Util) {
    var bounty;
    return {
        addBounty: function() {
            var amount = parseInt(bounty.bountyAmount), index = bounty.bountyIndex;
            if(!amount || amount < 0 || amount > Global.getKudos()) return;
            bounty = { bountyAmount: amount, bountyIndex: index, bountySet: true };
            FireService.transact('selection/'+index+'/bounty',amount);
            Global.changeKudos(amount*-1);
            FireService.sendEvent(Global.getName(),
                'placed a <strong>'+amount+'</strong> kudo bounty on "'+Videos.getVideo(index).title+'"!');
        },
        awardBounty: function() {
            var playing = Videos.getPlaying();
            if(!playing.bounty || +playing.index === +bounty.bountyIndex) return;
            if(bounty.bountySet) { // Set bounty but didn't win
                Global.changeKudos(bounty.bountyAmount); // Refund
            }
            if(playing.votes && playing.votes[Global.getName()]) { // Voted on winner
                Global.changeKudos(playing.bounty / Math.max(1,Util.countProperties(playing.votes,false)-1));
            }
        },
        init: function() { 
            console.log('init bounty',Videos.getSelection());
            bounty = { bountyAmount: 1, bountyIndex: 0, bountySet: false, selection: Videos.getSelection() }; 
            return bounty; 
        }
    };
});