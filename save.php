<?php
if(isset($_GET['data'])) {
  include_once("config.php");
  $jdata = $_GET['data'];
  //echo $jdata;
  //echo 'decoden:';
  $data = json_decode($jdata, TRUE);
  //var_dump($data);

  $user_id = 1;//fixme
  $country = $data['country'];
  $yearvisited = $data['yearvisited'];
  $comment = $data['comment'];

  $available = False;
  //check if already available
  $result = mysqli_query($mysqli, "SELECT COUNT(*) FROM visited_data WHERE user=$user_id AND country='$country'");
  while($res = mysqli_fetch_array($result))
  {
    if ($res['COUNT(*)'] == 0){
      $available = True;
    }
  }
  if (!$available){
    //if not available, update
    //special case: yearvisited == 0 -> REMOVE
    if($yearvisited == 0){
      $result = mysqli_query($mysqli, "DELETE FROM visited_data WHERE user = $user_id AND country = '$country'");
    }
    else{
      $result = mysqli_query($mysqli, "UPDATE visited_data SET year='$yearvisited',comment='$comment',updated=NOW() WHERE user=$user_id AND country='$country'");
    }
    if($result){
      //display success message
    //special case: yearvisited == 0 -> REMOVE
      if($yearvisited == 0){
        echo "<font color='orange'>Data removed successfully.";
      }else{
        echo "<font color='green'>Data updated successfully.";
      }
    } else {
      echo "<font color='red'>Error while updating data.";
    }
  }
  //else INSERT
  else {
    //insert data to database
    $result = mysqli_query($mysqli, "INSERT INTO visited_data(user,country,year,comment,updated) VALUES('$user_id','$country','$yearvisited','$comment',NOW())");
    if($result){
      //display success message
      echo "<font color='green'>Data added successfully.";
    } else {
      echo "<font color='red'>Error while adding data.";
    }
  }
  mysqli_close($mysqli);
}
else { echo 'graag data opgeven'; }
?>

