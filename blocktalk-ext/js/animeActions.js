import anime from 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js'

let t1 = anime.timeline({
  autoplay: false,
})

t1.add({
  targets: '.capsule',
  width: "+200",
}).add({
  targets: '#profile1',
  translateY: [10,0],
  opacity: [0,1],
  begin: function(){
    document.querySelector("#profile1").style.display = "inline-block";
  }
},'+=200').add({
  targets: "#profile1 .profile-circle",
  opacity: [1,0],
}).add({
  targets: '#profile1',
  translateX: -10,
}).add({
  targets: '.capsule',
  width: '+220',
}).add({
  targets: '#profile2',
  translateY: [10,0],
  translateX: [-12,-12],
  opacity: [0,1],
  begin: function(){
    document.querySelector("#profile2").style.display = "inline-block";
  }
}).add({
  targets: "#profile2 .profile-circle",
  opacity: [1,0],
}).add({
  targets: '#profile2',
  translateX: -30,
}).add({
  targets: '.capsule',
  width: '+200'
}).add({
  targets: '.capsule',
  width: '+240'
}).add({
  targets: '.counter',
  begin: function(){
    document.querySelector(".counter").style.display = "inline-block";
  },
  translateY: [10,0],
  opacity: [0,1],
},"+=500")

export let prevUserCount = 0;

export function handleSocketUpdateUserCount(count, elements) {
  return new Promise((resolve, reject) => {
    elements.userCount.innerText = "Kullanıcı Sayısı: " + count;

    if (count > prevUserCount) {
      t1.play()
        .then(() => t1.restart())
        .then(() => resolve())
        .catch((error) => reject(error));
    }
    else {
      resolve();
    }
    prevUserCount = count;
  });
};
