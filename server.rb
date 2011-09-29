#!/usr/bin/env ruby

require 'rubygems'
require 'em-websocket'

@sockets = []

EventMachine.run do
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8088) do |ws|
    puts "started dotland server on port 8088"

    ws.onopen {
      puts "onopen"
      @sockets << ws
    }

    ws.onmessage { |msg|
      puts "onmessage: #{msg}"
      @sockets.each { |s| s.send(msg) unless s == ws }
    }

    ws.onclose {
      puts "onclose"
      @sockets.delete(ws)
    }
  end
end

