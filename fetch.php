<?php
// {"countries":[{"country":"test","yearvisited":"2010","comment":"testje"},{"country":"test2","yearvisited":"2010","comment":"testje"}]}

include_once('config.php');

if(isset($_GET['user_id'])) {
  $user_id = mysqli_real_escape_string($mysqli, $_GET['user_id']);
}
else $user_id = 1;//fixme

$result = mysqli_query($mysqli, "SELECT country,year,comment FROM visited_data WHERE user=$user_id");
if($result)
{
  $json = array();
  while($res = mysqli_fetch_array($result))
  {
    array_push($json, array('country' => $res['country'], 'yearvisited' => $res['year'], 'comment' => $res['comment']));
  }
  mysqli_free_result($result);
  mysqli_close($mysqli);

  $json1 = array();
  array_push($json1, array('countries' => $json));
  //echo print_r($json1[0]);

  //header('Content-Type: application/json');
  echo json_encode($json1[0]);

}
?>
